import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BookOpenIcon, MessageSquareIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProfileSection } from "@/components/mypage/profile-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "マイページ | ホンダナ",
  description: "あなたの本棚とプロフィール",
};

export default async function MyPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // プロフィール取得
  const { data: profile } = await supabase
    .from("users")
    .select("username, avatar_url, bio")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // フォロー数・フォロワー数・読了数・レビュー数を並列取得
  const [followingResult, followersResult, completedResult, reviewResult] =
    await Promise.all([
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", user.id),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", user.id),
      supabase
        .from("user_books")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "completed"),
      supabase
        .from("reviews")
        .select("*, user_books!inner(*)", { count: "exact", head: true })
        .eq("user_books.user_id", user.id),
    ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <ProfileSection
        username={profile.username}
        avatarUrl={profile.avatar_url}
        bio={profile.bio}
        followingCount={followingResult.count ?? 0}
        followersCount={followersResult.count ?? 0}
        completedCount={completedResult.count ?? 0}
        reviewCount={reviewResult.count ?? 0}
      />

      <Tabs defaultValue="bookshelf" className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bookshelf" className="gap-1">
            <BookOpenIcon className="h-4 w-4" />
            本棚
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-1">
            <MessageSquareIcon className="h-4 w-4" />
            レビュー
          </TabsTrigger>
        </TabsList>
        <TabsContent value="bookshelf">
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">
              本棚に本を追加すると、ここに表示されます
            </p>
          </div>
        </TabsContent>
        <TabsContent value="reviews">
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">
              レビューを投稿すると、ここに表示されます
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
