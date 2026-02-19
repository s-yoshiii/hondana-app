import { searchNdlBooks } from "@/lib/ndl-search";
import { fetchCoversByIsbn } from "@/lib/openbd";

const GOOGLE_BOOKS_API_BASE = "https://www.googleapis.com/books/v1/volumes";

// Google Books API のレスポンス型
type GoogleBooksSearchResponse = {
  totalItems: number;
  items?: GoogleBooksVolume[];
};

type GoogleBooksVolume = {
  id: string;
  volumeInfo: {
    title: string;
    subtitle?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    industryIdentifiers?: Array<{
      type: "ISBN_10" | "ISBN_13" | "ISSN" | "OTHER";
      identifier: string;
    }>;
    imageLinks?: {
      smallThumbnail?: string;
      thumbnail?: string;
    };
  };
};

// アプリ内で使用する正規化された書籍型
export type GoogleBook = {
  googleBooksId: string;
  title: string;
  author: string | null;
  isbn: string | null;
  coverImageUrl: string | null;
  publisher: string | null;
  publishedDate: string | null;
  description: string | null;
};

function normalizeVolume(volume: GoogleBooksVolume): GoogleBook {
  const info = volume.volumeInfo;

  const isbn13 = info.industryIdentifiers?.find((id) => id.type === "ISBN_13");
  const isbn10 = info.industryIdentifiers?.find((id) => id.type === "ISBN_10");
  const isbn = isbn13?.identifier ?? isbn10?.identifier ?? null;

  let coverImageUrl = info.imageLinks?.thumbnail ?? null;
  if (coverImageUrl) {
    coverImageUrl = coverImageUrl.replace("http://", "https://");
  }

  return {
    googleBooksId: volume.id,
    title: info.title,
    author: info.authors?.join(", ") ?? null,
    isbn,
    coverImageUrl,
    publisher: info.publisher ?? null,
    publishedDate: info.publishedDate ?? null,
    description: info.description ?? null,
  };
}

/** Google Books API を並列取得（一般検索 + 著者名検索）して最大 80 件返す */
async function searchGoogleBooks(query: string): Promise<GoogleBook[]> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const params = `&maxResults=40&printType=books${apiKey ? `&key=${apiKey}` : ""}`;

  // 一般検索（タイトル・著者・説明文など）と著者名限定検索を並列取得
  const [res1, res2] = await Promise.all([
    fetch(
      `${GOOGLE_BOOKS_API_BASE}?q=${encodeURIComponent(query)}&startIndex=0${params}`,
      { next: { revalidate: 300 } },
    ),
    fetch(
      `${GOOGLE_BOOKS_API_BASE}?q=${encodeURIComponent(`inauthor:${query}`)}${params}`,
      { next: { revalidate: 300 } },
    ),
  ]);

  const results: GoogleBook[] = [];
  for (const res of [res1, res2]) {
    if (!res.ok) continue;
    const data: GoogleBooksSearchResponse = await res.json();
    if (data.items) results.push(...data.items.map(normalizeVolume));
  }
  return results;
}

/**
 * Google Books + NDL Search を並列検索し、結果をマージして返す
 * NDL の結果は OpenBD で書影を補完する
 */
export async function searchBooks(query: string): Promise<GoogleBook[]> {
  // Google Books（最大80件）と NDL Search（最大100件）を並列検索
  const [googleResults, ndlResults] = await Promise.all([
    searchGoogleBooks(query),
    searchNdlBooks(query).catch(() => [] as GoogleBook[]),
  ]);

  // NDL 結果の書影を OpenBD で補完
  const ndlIsbns = ndlResults
    .map((b) => b.isbn)
    .filter((isbn): isbn is string => isbn !== null);

  let coverMap = new Map<string, string>();
  if (ndlIsbns.length > 0) {
    coverMap = await fetchCoversByIsbn(ndlIsbns).catch(
      () => new Map<string, string>(),
    );
  }

  const ndlWithCovers = ndlResults.map((book) => ({
    ...book,
    coverImageUrl: (book.isbn ? coverMap.get(book.isbn) : null) ?? null,
  }));

  // マージ: Google Books を優先し、NDL の重複しない結果を追加
  const seenIsbns = new Set<string>();
  const seenTitles = new Set<string>();
  const merged: GoogleBook[] = [];

  for (const book of googleResults) {
    if (book.isbn) seenIsbns.add(book.isbn);
    seenTitles.add(book.title.toLowerCase());
    merged.push(book);
  }

  for (const book of ndlWithCovers) {
    // ISBN で重複チェック
    if (book.isbn && seenIsbns.has(book.isbn)) continue;
    // タイトルで重複チェック
    if (seenTitles.has(book.title.toLowerCase())) continue;

    if (book.isbn) seenIsbns.add(book.isbn);
    seenTitles.add(book.title.toLowerCase());
    merged.push(book);
  }

  // 関連度スコアで再ランキング（著者一致 > タイトル一致 > その他）
  // 同スコア内では元の順序を維持（stable sort）
  const queryLower = query.toLowerCase();
  const relevanceScore = (book: GoogleBook): number => {
    if (book.author?.toLowerCase().includes(queryLower)) return 2;
    if (book.title.toLowerCase().includes(queryLower)) return 1;
    return 0;
  };
  merged.sort((a, b) => relevanceScore(b) - relevanceScore(a));

  return merged;
}

export async function getBookByGoogleId(
  googleBooksId: string,
): Promise<GoogleBook | null> {
  // NDL 経由の書籍は ISBN で OpenBD から取得
  if (googleBooksId.startsWith("ndl-")) {
    const isbn = googleBooksId.replace("ndl-", "");
    if (!isbn || isbn.includes("-")) return null;

    const coverMap = await fetchCoversByIsbn([isbn]).catch(
      () => new Map<string, string>(),
    );

    // OpenBD の API から書籍情報も取得
    const res = await fetch(
      `https://api.openbd.jp/v1/get?isbn=${isbn}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;

    const data = await res.json();
    const item = data?.[0];
    if (!item?.summary) return null;

    return {
      googleBooksId,
      title: item.summary.title || "不明なタイトル",
      author: item.summary.author
        ? item.summary.author.replace(/,\s*\d{4}-?.*$/, "").replace(/,\s*/g, "")
        : null,
      isbn,
      coverImageUrl: coverMap.get(isbn) ?? null,
      publisher: item.summary.publisher || null,
      publishedDate: item.summary.pubdate || null,
      description: null,
    };
  }

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const url = `${GOOGLE_BOOKS_API_BASE}/${encodeURIComponent(googleBooksId)}${apiKey ? `?key=${apiKey}` : ""}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (!res.ok) {
    return null;
  }

  const data: GoogleBooksVolume = await res.json();
  return normalizeVolume(data);
}
