import { SearchIcon } from "lucide-react";
import type { GoogleBook } from "@/lib/google-books";
import { BookSearchResultCard } from "@/components/book-search-result-card";

type BookSearchResultsProps = {
  query: string;
  books: GoogleBook[];
};

export function BookSearchResults({ query, books }: BookSearchResultsProps) {
  return (
    <div>
      <h1 className="text-xl font-bold">
        「{query}」の検索結果
        <span className="ml-2 text-sm font-normal text-muted-foreground">
          {books.length}件
        </span>
      </h1>

      {books.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-2 text-muted-foreground">
          <SearchIcon className="h-10 w-10" />
          <p>検索結果が見つかりませんでした</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {books.map((book) => (
            <BookSearchResultCard key={book.googleBooksId} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
