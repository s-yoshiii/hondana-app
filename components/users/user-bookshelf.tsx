import Image from "next/image";
import Link from "next/link";
import { BookOpenIcon, LockIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/books/star-rating";
import { BOOK_STATUS_LABELS } from "@/lib/constants";

type BookshelfItem = {
  id: string;
  status: string;
  rating: number | null;
  google_books_id: string | null;
  book: {
    title: string;
    author: string | null;
    cover_image_url: string | null;
  };
};

type UserBookshelfProps = {
  items: BookshelfItem[];
  canViewFull: boolean;
};

const PREVIEW_COUNT = 3;

export function UserBookshelf({ items, canViewFull }: UserBookshelfProps) {
  if (items.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">
          本棚にはまだ本がありません
        </p>
      </div>
    );
  }

  const displayItems = canViewFull ? items : items.slice(0, PREVIEW_COUNT);
  const hiddenCount = canViewFull ? 0 : Math.max(0, items.length - PREVIEW_COUNT);

  return (
    <div className="space-y-3">
      {displayItems.map((item) => {
        const href = item.google_books_id
          ? `/books/${item.google_books_id}`
          : "#";
        return (
          <Link
            key={item.id}
            href={href}
            className="flex gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
          >
            <div className="h-[100px] w-[68px] shrink-0 overflow-hidden rounded bg-muted">
              {item.book.cover_image_url ? (
                <Image
                  src={item.book.cover_image_url}
                  alt={item.book.title}
                  width={68}
                  height={100}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <BookOpenIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center gap-1">
              <h3 className="font-semibold line-clamp-2">{item.book.title}</h3>
              {item.book.author && (
                <p className="text-sm text-muted-foreground">
                  {item.book.author}
                </p>
              )}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {BOOK_STATUS_LABELS[item.status] ?? item.status}
                </Badge>
                {item.rating && <StarRating rating={item.rating} size="sm" />}
              </div>
            </div>
          </Link>
        );
      })}

      {hiddenCount > 0 && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed py-6 text-sm text-muted-foreground">
          <LockIcon className="h-4 w-4" />
          <span>他 {hiddenCount} 冊はフォローすると表示されます</span>
        </div>
      )}
    </div>
  );
}
