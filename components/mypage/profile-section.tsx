import Link from "next/link";
import { PencilIcon, BookOpenIcon, MessageSquareIcon, UsersIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ProfileSectionProps = {
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  followingCount: number;
  followersCount: number;
  completedCount: number;
  reviewCount: number;
};

export function ProfileSection({
  username,
  avatarUrl,
  bio,
  followingCount,
  followersCount,
  completedCount,
  reviewCount,
}: ProfileSectionProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {/* アバター */}
          <Avatar className="h-20 w-20">
            <AvatarImage src={avatarUrl ?? ""} alt={username} />
            <AvatarFallback className="text-2xl">
              {username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* プロフィール情報 */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center">
              <h1 className="text-xl font-bold">{username}</h1>
              <Button variant="outline" size="sm" asChild>
                <Link href="/mypage/edit">
                  <PencilIcon className="mr-1 h-3 w-3" />
                  編集
                </Link>
              </Button>
            </div>

            {bio && (
              <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                {bio}
              </p>
            )}

            {/* フォロー情報 */}
            <div className="mt-3 flex items-center justify-center gap-4 sm:justify-start">
              <div className="flex items-center gap-1 text-sm">
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{followingCount}</span>
                <span className="text-muted-foreground">フォロー</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="font-semibold">{followersCount}</span>
                <span className="text-muted-foreground">フォロワー</span>
              </div>
            </div>

            {/* 統計 */}
            <div className="mt-3 flex items-center justify-center gap-4 sm:justify-start">
              <div className="flex items-center gap-1 text-sm">
                <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{completedCount}</span>
                <span className="text-muted-foreground">冊読了</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{reviewCount}</span>
                <span className="text-muted-foreground">件レビュー</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
