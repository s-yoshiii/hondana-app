import Image from "next/image";
import { BookOpenIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/books/star-rating";
import type { GoogleBook } from "@/lib/google-books";

type BookDetailInfoProps = {
  book: GoogleBook;
  averageRating: number | null;
  ratingCount: number;
};

export function BookDetailInfo({
  book,
  averageRating,
  ratingCount,
}: BookDetailInfoProps) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row">
      {/* 表紙画像 */}
      <div className="mx-auto h-[300px] w-[200px] shrink-0 overflow-hidden rounded-lg bg-muted sm:mx-0">
        {book.coverImageUrl ? (
          <Image
            src={book.coverImageUrl}
            alt={book.title}
            width={200}
            height={300}
            className="h-full w-full object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpenIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* 書籍情報 */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{book.title}</h1>

        {book.author && (
          <p className="text-lg text-muted-foreground">{book.author}</p>
        )}

        {averageRating !== null && (
          <div className="flex items-center gap-2">
            <StarRating rating={averageRating} size="md" />
            <span className="text-sm text-muted-foreground">
              {averageRating.toFixed(1)}（{ratingCount}件）
            </span>
          </div>
        )}

        <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
          {book.publisher && (
            <span>{book.publisher}</span>
          )}
          {book.publishedDate && (
            <span>{book.publishedDate}</span>
          )}
        </div>

        {book.isbn && (
          <div className="mt-1">
            <Badge variant="outline">ISBN: {book.isbn}</Badge>
          </div>
        )}

        {book.description && (
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-6">
            {book.description}
          </p>
        )}
      </div>
    </div>
  );
}
