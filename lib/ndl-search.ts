import type { GoogleBook } from "@/lib/google-books";

const NDL_API_BASE = "https://ndlsearch.ndl.go.jp/api/sru";

/**
 * 国立国会図書館サーチAPIで書籍を検索する
 * dcndl スキーマのXMLレスポンスをパースして GoogleBook 型に正規化
 */
export async function searchNdlBooks(
  query: string,
  maxResults = 30,
): Promise<GoogleBook[]> {
  // CQL: タイトル OR 著者で検索、図書に限定
  const cql = `(title="${query}" OR creator="${query}") AND mediatype="books"`;
  const url = `${NDL_API_BASE}?operation=searchRetrieve&query=${encodeURIComponent(cql)}&recordSchema=dcndl&maximumRecords=${maxResults}`;

  const res = await fetch(url, { next: { revalidate: 300 } });

  if (!res.ok) return [];

  const xml = await res.text();
  return parseNdlResponse(xml);
}

/**
 * NDL SRU XMLレスポンスをパースする
 */
function parseNdlResponse(xml: string): GoogleBook[] {
  const books: GoogleBook[] = [];

  // <recordData>...</recordData> ブロックを抽出
  const recordDataBlocks = xml.match(/<recordData>[\s\S]*?<\/recordData>/g);
  if (!recordDataBlocks) return books;

  for (const block of recordDataBlocks) {
    // HTMLエンティティをデコード
    const decoded = block
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"');

    const title = extractTag(decoded, "dcterms:title");
    if (!title) continue;

    const authorRaw = extractTag(decoded, "foaf:name");
    // 著者名のフォーマット正規化: "村田, 沙耶香, 1979-" → "村田沙耶香"
    const author = authorRaw ? normalizeAuthor(authorRaw) : null;

    const publisher = extractPublisher(decoded);
    const isbn = extractIsbn(decoded);
    const publishedDate = extractTag(decoded, "dcterms:issued");

    books.push({
      googleBooksId: isbn ? `ndl-${isbn.replace(/-/g, "")}` : `ndl-${Date.now()}-${books.length}`,
      title,
      author,
      isbn: isbn ? isbn.replace(/-/g, "") : null,
      coverImageUrl: null, // OpenBD で後から補完
      publisher,
      publishedDate: publishedDate ?? null,
      description: null,
    });
  }

  return books;
}

/** XML からタグの最初のテキスト内容を抽出 */
function extractTag(xml: string, tagName: string): string | null {
  const regex = new RegExp(`<${tagName}[^>]*>([^<]+)</${tagName}>`);
  const match = xml.match(regex);
  return match?.[1]?.trim() ?? null;
}

/** publisher は foaf:Agent 内の foaf:name から取得 */
function extractPublisher(xml: string): string | null {
  const publisherBlock = xml.match(
    /<dcterms:publisher>[\s\S]*?<\/dcterms:publisher>/,
  );
  if (!publisherBlock) return null;
  return extractTag(publisherBlock[0], "foaf:name");
}

/** ISBN を抽出（dcterms:identifier の datatype が ISBN のもの） */
function extractIsbn(xml: string): string | null {
  const match = xml.match(
    /<dcterms:identifier[^>]*ISBN[^>]*>([^<]+)<\/dcterms:identifier>/,
  );
  return match?.[1]?.trim() ?? null;
}

/** 著者名を正規化: "村田, 沙耶香, 1979-" → "村田沙耶香" */
function normalizeAuthor(raw: string): string {
  return raw
    .replace(/,\s*\d{4}-?.*$/, "") // 生年以降を削除
    .replace(/,\s*/g, "") // カンマとスペースを削除
    .trim();
}
