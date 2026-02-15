import Link from "next/link";
import Image from "next/image";
import { PencilIcon } from "lucide-react";
import { StarRating } from "@/components/books/star-rating";

type MyReviewItem = {
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

type MyReviewListProps = {
  items: MyReviewItem[];
};

export function MyReviewList({ items }: MyReviewListProps) {
  if (items.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">
          レビューを投稿すると、ここに表示されます
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const formattedDate = new Date(item.createdAt).toLocaleDateString(
          "ja-JP",
          { year: "numeric", month: "long", day: "numeric" },
        );
        const previewContent =
          item.content.length > 150
            ? item.content.slice(0, 150) + "..."
            : item.content;

        return (
          <div key={item.reviewId} className="rounded-lg border p-4">
            <div className="flex gap-4">
              {/* 書籍カバー */}
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

              {/* レビュー情報 */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
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
                  </div>
                  {item.googleBooksId && (
                    <Link
                      href={`/books/${item.googleBooksId}/review/edit`}
                      className="shrink-0 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                  )}
                </div>

                <div className="mt-1 flex items-center gap-2">
                  {item.rating && <StarRating rating={item.rating} />}
                  <span className="text-xs text-muted-foreground">
                    {formattedDate}
                  </span>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {previewContent}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
