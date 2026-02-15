const OPENBD_API_BASE = "https://api.openbd.jp/v1/get";

type OpenBDSummary = {
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  pubdate: string;
  cover: string;
};

type OpenBDResponse = {
  summary: OpenBDSummary;
} | null;

/**
 * OpenBD API で ISBN から書影URLを一括取得する
 * 最大100件まで対応
 */
export async function fetchCoversByIsbn(
  isbns: string[],
): Promise<Map<string, string>> {
  const coverMap = new Map<string, string>();

  if (isbns.length === 0) return coverMap;

  // ハイフンを除去して正規化
  const normalizedIsbns = isbns.map((isbn) => isbn.replace(/-/g, ""));

  const url = `${OPENBD_API_BASE}?isbn=${normalizedIsbns.join(",")}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (!res.ok) return coverMap;

  const data: OpenBDResponse[] = await res.json();

  for (const item of data) {
    if (item?.summary?.cover) {
      coverMap.set(item.summary.isbn, item.summary.cover);
      // ハイフン付きISBNでも引けるようにする
      const original = isbns.find(
        (isbn) => isbn.replace(/-/g, "") === item.summary.isbn,
      );
      if (original && original !== item.summary.isbn) {
        coverMap.set(original, item.summary.cover);
      }
    }
  }

  return coverMap;
}
