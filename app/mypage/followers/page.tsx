import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/follow/follow-button";

export const metadata: Metadata = {
  title: "フォロワー | ホンダナ",
};

export default async function FollowersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // フォロワー一覧を取得
  const { data: followers } = await supabase
    .from("follows")
    .select("follower_id, users!follows_follower_id_fkey(id, username, avatar_url, bio)")
    .eq("following_id", user.id)
    .order("created_at", { ascending: false });

  // 自分がフォローしているユーザーIDを取得（フォローバック状態の判定用）
  const { data: myFollowings } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);

  const followingIds = new Set((myFollowings ?? []).map((f) => f.following_id));

  const items = (followers ?? []).map((f) => {
    const u = f.users as unknown as {
      id: string;
      username: string;
      avatar_url: string | null;
      bio: string | null;
    };
    return {
      ...u,
      isFollowingBack: followingIds.has(u.id),
    };
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/mypage"
          className="rounded-md p-1 hover:bg-accent"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">フォロワー（{items.length}人）</h1>
      </div>

      {items.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">
            まだフォロワーはいません
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={item.avatar_url ?? undefined} />
                  <AvatarFallback>
                    {item.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{item.username}</p>
                  {item.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {item.bio}
                    </p>
                  )}
                </div>
              </div>
              <FollowButton
                targetUserId={item.id}
                isFollowing={item.isFollowingBack}
                isLoggedIn={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
