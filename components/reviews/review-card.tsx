import Link from "next/link";
import { PencilIcon, LockIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/books/star-rating";
import { FollowButton } from "@/components/follow/follow-button";

type ReviewCardProps = {
  reviewerName: string;
  reviewerAvatarUrl: string | null;
  reviewerUserId?: string;
  rating: number | null;
  content: string;
  createdAt: string;
  canViewFull: boolean;
  isOwner: boolean;
  isFollowing?: boolean;
  isLoggedIn?: boolean;
  editUrl?: string;
};

export function ReviewCard({
  reviewerName,
  reviewerAvatarUrl,
  reviewerUserId,
  rating,
  content,
  createdAt,
  canViewFull,
  isOwner,
  isFollowing = false,
  isLoggedIn = false,
  editUrl,
}: ReviewCardProps) {
  const displayContent = canViewFull
    ? content
    : content.length > 100
      ? content.slice(0, 100) + "..."
      : content;

  const formattedDate = new Date(createdAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {reviewerUserId ? (
            <Link href={`/users/${reviewerUserId}`}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={reviewerAvatarUrl ?? undefined} />
                <AvatarFallback>{reviewerName.charAt(0)}</AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="h-8 w-8">
              <AvatarImage src={reviewerAvatarUrl ?? undefined} />
              <AvatarFallback>{reviewerName.charAt(0)}</AvatarFallback>
            </Avatar>
          )}
          <div>
            {reviewerUserId ? (
              <Link
                href={`/users/${reviewerUserId}`}
                className="text-sm font-medium hover:underline"
              >
                {reviewerName}
              </Link>
            ) : (
              <p className="text-sm font-medium">{reviewerName}</p>
            )}
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {rating && <StarRating rating={rating} />}
          {isOwner && editUrl && (
            <Link
              href={editUrl}
              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <PencilIcon className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      <div className="mt-3">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {displayContent}
        </p>
        {!canViewFull && content.length > 100 && (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <LockIcon className="h-3 w-3" />
            <span>続きを読むにはフォローが必要です</span>
            {reviewerUserId && !isOwner && (
              <FollowButton
                targetUserId={reviewerUserId}
                isFollowing={isFollowing}
                isLoggedIn={isLoggedIn}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
