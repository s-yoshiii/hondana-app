"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlusIcon, UserCheckIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { followUser, unfollowUser } from "@/lib/actions/follow";

type FollowButtonProps = {
  targetUserId: string;
  isFollowing: boolean;
  isLoggedIn: boolean;
};

export function FollowButton({
  targetUserId,
  isFollowing,
  isLoggedIn,
}: FollowButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticFollowing, setOptimisticFollowing] = useOptimistic(isFollowing);

  function handleClick() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    startTransition(async () => {
      setOptimisticFollowing(!optimisticFollowing);
      if (optimisticFollowing) {
        const result = await unfollowUser(targetUserId);
        if (result.error) {
          setOptimisticFollowing(true);
          toast.error(result.error);
        }
      } else {
        const result = await followUser(targetUserId);
        if (result.error) {
          setOptimisticFollowing(false);
          toast.error(result.error);
        }
      }
    });
  }

  if (optimisticFollowing) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={isPending}
      >
        <UserCheckIcon className="mr-1 h-4 w-4" />
        フォロー中
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      onClick={handleClick}
      disabled={isPending}
    >
      <UserPlusIcon className="mr-1 h-4 w-4" />
      フォローする
    </Button>
  );
}
