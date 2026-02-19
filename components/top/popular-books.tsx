import Link from "next/link";
import Image from "next/image";
import { BookOpenIcon, TrophyIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/books/star-rating";

export type PopularBook = {
  id: string;
  title: string;
  author: string | null;
  coverImageUrl: string | null;
  googleBooksId: string;
  reviewCount: number;
  avgRating: number | null;
};

export function PopularBooks({ books }: { books: PopularBook[] }) {
  if (books.length === 0) return null;

  return (
    <section>
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <TrophyIcon className="h-5 w-5 text-yellow-500" />
        人気の本
      </h2>
      <div className="mt-3 space-y-2">
        {books.map((book, index) => (
          <Link key={book.id} href={`/books/${book.googleBooksId}`}>
            <Card className="transition-colors hover:bg-accent">
              <CardContent className="flex items-center gap-3 px-4 py-3">
                <span className="w-5 shrink-0 text-center text-sm font-bold text-muted-foreground">
                  {index + 1}
                </span>
                <div className="h-14 w-10 shrink-0 overflow-hidden rounded bg-muted">
                  {book.coverImageUrl ? (
                    <Image
                      src={book.coverImageUrl}
                      alt={book.title}
                      width={40}
                      height={56}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <BookOpenIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium">{book.title}</p>
                  {book.author && (
                    <p className="text-xs text-muted-foreground">{book.author}</p>
                  )}
                  <div className="mt-1 flex items-center gap-2">
                    {book.avgRating && <StarRating rating={book.avgRating} />}
                    <span className="text-xs text-muted-foreground">
                      {book.reviewCount}件のレビュー
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
