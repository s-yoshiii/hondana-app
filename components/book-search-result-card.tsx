import Link from "next/link";
import Image from "next/image";
import { BookOpenIcon } from "lucide-react";
import type { GoogleBook } from "@/lib/google-books";

export function BookSearchResultCard({ book }: { book: GoogleBook }) {
  return (
    <Link
      href={`/books/${book.googleBooksId}`}
      className="flex gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
    >
      <div className="h-[120px] w-[80px] shrink-0 overflow-hidden rounded bg-muted">
        {book.coverImageUrl ? (
          <Image
            src={book.coverImageUrl}
            alt={book.title}
            width={80}
            height={120}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpenIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center">
        <h2 className="font-semibold line-clamp-2">{book.title}</h2>
        {book.author && (
          <p className="mt-1 text-sm text-muted-foreground">{book.author}</p>
        )}
        {book.publisher && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {book.publisher}
          </p>
        )}
      </div>
    </Link>
  );
}
