import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "lucide-react";
import type { GoogleBook } from "@/lib/google-books";
import { BookSearchResultCard } from "@/components/book-search-result-card";
import { Button } from "@/components/ui/button";

type BookSearchResultsProps = {
  query: string;
  books: GoogleBook[];
  currentPage: number;
  totalCount: number;
  totalPages: number;
};

export function BookSearchResults({
  query,
  books,
  currentPage,
  totalCount,
  totalPages,
}: BookSearchResultsProps) {
  const encodedQuery = encodeURIComponent(query);

  return (
    <div>
      <h1 className="text-xl font-bold">
        「{query}」の検索結果
        <span className="ml-2 text-sm font-normal text-muted-foreground">
          {totalCount}件
        </span>
      </h1>

      {books.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-2 text-muted-foreground">
          <SearchIcon className="h-10 w-10" />
          <p>検索結果が見つかりませんでした</p>
        </div>
      ) : (
        <>
          <div className="mt-4 space-y-3">
            {books.map((book) => (
              <BookSearchResultCard key={book.googleBooksId} book={book} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" asChild disabled={currentPage <= 1}>
                {currentPage <= 1 ? (
                  <span className="flex items-center gap-1">
                    <ChevronLeftIcon className="h-4 w-4" />
                    前へ
                  </span>
                ) : (
                  <Link href={`/?q=${encodedQuery}&page=${currentPage - 1}`} className="flex items-center gap-1">
                    <ChevronLeftIcon className="h-4 w-4" />
                    前へ
                  </Link>
                )}
              </Button>

              <span className="text-sm text-muted-foreground">
                {currentPage} / {totalPages} ページ
              </span>

              <Button variant="outline" size="sm" asChild disabled={currentPage >= totalPages}>
                {currentPage >= totalPages ? (
                  <span className="flex items-center gap-1">
                    次へ
                    <ChevronRightIcon className="h-4 w-4" />
                  </span>
                ) : (
                  <Link href={`/?q=${encodedQuery}&page=${currentPage + 1}`} className="flex items-center gap-1">
                    次へ
                    <ChevronRightIcon className="h-4 w-4" />
                  </Link>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
