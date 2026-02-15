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

export async function searchBooks(
  query: string,
  maxResults = 40,
): Promise<GoogleBook[]> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const url = `${GOOGLE_BOOKS_API_BASE}?q=${encodeURIComponent(query)}&maxResults=${maxResults}&printType=books${apiKey ? `&key=${apiKey}` : ""}`;

  const res = await fetch(url, { next: { revalidate: 300 } });

  if (!res.ok) {
    return [];
  }

  const data: GoogleBooksSearchResponse = await res.json();

  if (!data.items || data.totalItems === 0) {
    return [];
  }

  return data.items.map(normalizeVolume);
}

export async function getBookByGoogleId(
  googleBooksId: string,
): Promise<GoogleBook | null> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const url = `${GOOGLE_BOOKS_API_BASE}/${encodeURIComponent(googleBooksId)}${apiKey ? `?key=${apiKey}` : ""}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (!res.ok) {
    return null;
  }

  const data: GoogleBooksVolume = await res.json();
  return normalizeVolume(data);
}
