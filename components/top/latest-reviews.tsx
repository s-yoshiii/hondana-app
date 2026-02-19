import Link from "next/link";
import { MessageSquareIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/books/star-rating";

export type LatestReview = {
  id: string;
  content: string;
  createdAt: string;
  rating: number | null;
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  book: {
    title: string;
    googleBooksId: string | null;
    coverImageUrl: string | null;
  };
};

export function LatestReviews({ reviews }: { reviews: LatestReview[] }) {
  if (reviews.length === 0) return null;

  return (
    <section>
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <MessageSquareIcon className="h-5 w-5" />
        最新レビュー
      </h2>
      <div className="mt-3 space-y-3">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="px-4 py-3">
              <div className="flex items-center justify-between">
                <Link
                  href={`/users/${review.user.id}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={review.user.avatarUrl ?? undefined} />
                    <AvatarFallback className="text-xs">
                      {review.user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{review.user.username}</span>
                </Link>
                {review.rating && <StarRating rating={review.rating} />}
              </div>

              {review.book.googleBooksId ? (
                <Link
                  href={`/books/${review.book.googleBooksId}`}
                  className="mt-2 block text-xs font-medium text-muted-foreground hover:underline"
                >
                  {review.book.title}
                </Link>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  {review.book.title}
                </p>
              )}

              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {review.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
