import { searchBooksAdvanced } from "@/lib/google-books";
import { BookSearchResults } from "@/components/book-search-results";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const PAGE_SIZE = 20;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    title?: string;
    author?: string;
    subject?: string;
    year?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const { q, title, author, subject, year, page: pageParam } = params;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10));

  const hasQuery = q || title || author || subject || year;

  let allBooks: Awaited<ReturnType<typeof searchBooksAdvanced>> = [];
  if (hasQuery) {
    allBooks = await searchBooksAdvanced({ q, title, author, subject, year });
  }

  const totalCount = allBooks.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const books = allBooks.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const buildPageUrl = (page: number) => {
    const urlParams = new URLSearchParams();
    if (q) urlParams.set("q", q);
    if (title) urlParams.set("title", title);
    if (author) urlParams.set("author", author);
    if (subject) urlParams.set("subject", subject);
    if (year) urlParams.set("year", year);
    urlParams.set("page", String(page));
    return `/search?${urlParams.toString()}`;
  };

  // 検索結果の見出し用ラベルを構築
  const searchLabel = [
    title && `タイトル:${title}`,
    author && `著者:${author}`,
    subject && `ジャンル:${subject}`,
    q,
  ]
    .filter(Boolean)
    .join(" ") || "";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">書籍検索</h1>

      <form action="/search" method="GET" className="mt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="q">キーワード</Label>
            <Input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="キーワードで検索..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="title">タイトル</Label>
            <Input
              id="title"
              name="title"
              defaultValue={title}
              placeholder="タイトルで絞り込み..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="author">著者名</Label>
            <Input
              id="author"
              name="author"
              defaultValue={author}
              placeholder="著者名で絞り込み..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="subject">ジャンル</Label>
            <Input
              id="subject"
              name="subject"
              defaultValue={subject}
              placeholder="例: 小説, ビジネス, 技術..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="year">出版年</Label>
            <Input
              id="year"
              name="year"
              type="number"
              defaultValue={year}
              placeholder="例: 2023"
              min="1900"
              max="2030"
            />
          </div>
        </div>
        <Button type="submit" className="mt-4">
          検索
        </Button>
      </form>

      {hasQuery && (
        <div className="mt-8">
          <BookSearchResults
            query={searchLabel}
            books={books}
            currentPage={safePage}
            totalCount={totalCount}
            totalPages={totalPages}
            buildPageUrl={buildPageUrl}
          />
        </div>
      )}
    </div>
  );
}
