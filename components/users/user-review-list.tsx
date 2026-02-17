import Link from "next/link";
import Image from "next/image";
import { LockIcon } from "lucide-react";
import { StarRating } from "@/components/books/star-rating";

type ReviewItem = {
  reviewId: string;
  content: string;
  createdAt: string;
  rating: number | null;
  googleBooksId: string | null;
  book: {
    title: string;
    author: string | null;
    coverImageUrl: string | null;
  };
};

type UserReviewListProps = {
  items: ReviewItem[];
  canViewFull: boolean;
};

const PREVIEW_COUNT = 1;
const PREVIEW_CONTENT_LENGTH = 100;

export function UserReviewList({ items, canViewFull }: UserReviewListProps) {
  if (items.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">
          まだレビューはありません
        </p>
      </div>
    );
  }

  const displayItems = canViewFull ? items : items.slice(0, PREVIEW_COUNT);
  const hiddenCount = canViewFull ? 0 : Math.max(0, items.length - PREVIEW_COUNT);

  return (
    <div className="space-y-4">
      {displayItems.map((item) => {
        const formattedDate = new Date(item.createdAt).toLocaleDateString(
          "ja-JP",
          { year: "numeric", month: "long", day: "numeric" },
        );

        const content = canViewFull
          ? item.content
          : item.content.length > PREVIEW_CONTENT_LENGTH
            ? item.content.slice(0, PREVIEW_CONTENT_LENGTH) + "..."
            : item.content;

        return (
          <div key={item.reviewId} className="rounded-lg border p-4">
            <div className="flex gap-4">
              <div className="shrink-0">
                {item.book.coverImageUrl ? (
                  <Link
                    href={
                      item.googleBooksId
                        ? `/books/${item.googleBooksId}`
                        : "#"
                    }
                  >
                    <Image
                      src={item.book.coverImageUrl}
                      alt={item.book.title}
                      width={60}
                      height={90}
                      className="rounded object-cover"
                    />
                  </Link>
                ) : (
                  <div className="flex h-[90px] w-[60px] items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                    No Image
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  href={
                    item.googleBooksId
                      ? `/books/${item.googleBooksId}`
                      : "#"
                  }
                  className="font-medium hover:underline"
                >
                  {item.book.title}
                </Link>
                {item.book.author && (
                  <p className="text-xs text-muted-foreground">
                    {item.book.author}
                  </p>
                )}

                <div className="mt-1 flex items-center gap-2">
                  {item.rating && <StarRating rating={item.rating} />}
                  <span className="text-xs text-muted-foreground">
                    {formattedDate}
                  </span>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {content}
                </p>

                {!canViewFull && item.content.length > PREVIEW_CONTENT_LENGTH && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <LockIcon className="h-3 w-3" />
                    <span>続きを読むにはフォローが必要です</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {hiddenCount > 0 && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed py-6 text-sm text-muted-foreground">
          <LockIcon className="h-4 w-4" />
          <span>他 {hiddenCount} 件のレビューはフォローすると表示されます</span>
        </div>
      )}
    </div>
  );
}
