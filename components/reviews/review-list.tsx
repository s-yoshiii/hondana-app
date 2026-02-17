import Link from "next/link";
import { PenSquareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "@/components/reviews/review-card";

type ReviewItem = {
  id: string;
  content: string;
  createdAt: string;
  rating: number | null;
  reviewerUserId: string;
  reviewerName: string;
  reviewerAvatarUrl: string | null;
};

type ReviewListProps = {
  reviews: ReviewItem[];
  currentUserId: string | null;
  followingUserIds: string[];
  googleBooksId: string;
  canWriteReview: boolean;
};

export function ReviewList({
  reviews,
  currentUserId,
  followingUserIds,
  googleBooksId,
  canWriteReview,
}: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">レビュー</h2>
          {canWriteReview && (
            <Button size="sm" asChild>
              <Link href={`/books/${googleBooksId}/review/new`}>
                <PenSquareIcon className="mr-1 h-4 w-4" />
                レビューを書く
              </Link>
            </Button>
          )}
        </div>
        <div className="mt-4 flex min-h-[120px] items-center justify-center rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">
            まだレビューはありません
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">レビュー（{reviews.length}件）</h2>
        {canWriteReview && (
          <Button size="sm" asChild>
            <Link href={`/books/${googleBooksId}/review/new`}>
              <PenSquareIcon className="mr-1 h-4 w-4" />
              レビューを書く
            </Link>
          </Button>
        )}
      </div>
      <div className="mt-4 space-y-4">
        {reviews.map((review) => {
          const isOwner = currentUserId === review.reviewerUserId;
          const isFollowing = followingUserIds.includes(review.reviewerUserId);
          const canViewFull = isOwner || isFollowing;

          return (
            <ReviewCard
              key={review.id}
              reviewerName={review.reviewerName}
              reviewerAvatarUrl={review.reviewerAvatarUrl}
              reviewerUserId={review.reviewerUserId}
              rating={review.rating}
              content={review.content}
              createdAt={review.createdAt}
              canViewFull={canViewFull}
              isOwner={isOwner}
              isFollowing={isFollowing}
              isLoggedIn={!!currentUserId}
              editUrl={
                isOwner
                  ? `/books/${googleBooksId}/review/edit`
                  : undefined
              }
            />
          );
        })}
      </div>
    </div>
  );
}
