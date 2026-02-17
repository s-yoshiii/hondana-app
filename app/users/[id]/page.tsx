import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookOpenIcon, MessageSquareIcon, UsersIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FollowButton } from "@/components/follow/follow-button";
import { UserBookshelf } from "@/components/users/user-bookshelf";
import { UserReviewList } from "@/components/users/user-review-list";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("users")
    .select("username")
    .eq("id", id)
    .single();

  return {
    title: profile
      ? `${profile.username} | ホンダナ`
      : "ユーザーが見つかりません | ホンダナ",
  };
}

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: targetUserId } = await params;
  const supabase = await createClient();

  // 対象ユーザーのプロフィール取得
  const { data: profile } = await supabase
    .from("users")
    .select("id, username, avatar_url, bio")
    .eq("id", targetUserId)
    .single();

  if (!profile) {
    notFound();
  }

  // 現在のログインユーザー
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwnPage = user?.id === targetUserId;

  // フォロー数・フォロワー数・フォロー状態・本棚・レビューを並列取得
  const [followingResult, followersResult, isFollowingResult, bookshelfResult, reviewsResult] =
    await Promise.all([
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", targetUserId),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", targetUserId),
      user && !isOwnPage
        ? supabase
            .from("follows")
            .select("id")
            .eq("follower_id", user.id)
            .eq("following_id", targetUserId)
            .single()
        : Promise.resolve({ data: null }),
      supabase
        .from("user_books")
        .select("id, status, rating, books(title, author, cover_image_url, google_books_id)")
        .eq("user_id", targetUserId)
        .order("updated_at", { ascending: false }),
      supabase
        .from("reviews")
        .select(
          "id, content, created_at, user_books!inner(rating, user_id, books!inner(title, author, cover_image_url, google_books_id))",
        )
        .eq("user_books.user_id", targetUserId)
        .order("created_at", { ascending: false }),
    ]);

  const isFollowing = !!isFollowingResult.data;
  const canViewFull = isOwnPage || isFollowing;

  // 本棚データ整形
  const allBookshelfItems = (bookshelfResult.data ?? []).map((item) => {
    const book = item.books as unknown as {
      title: string;
      author: string | null;
      cover_image_url: string | null;
      google_books_id: string | null;
    };
    return {
      id: item.id,
      status: item.status,
      rating: item.rating,
      google_books_id: book?.google_books_id ?? null,
      book: {
        title: book?.title ?? "不明な書籍",
        author: book?.author ?? null,
        cover_image_url: book?.cover_image_url ?? null,
      },
    };
  });

  // レビューデータ整形
  const allReviewItems = (reviewsResult.data ?? []).map((item) => {
    const ub = item.user_books as unknown as {
      rating: number | null;
      books: {
        title: string;
        author: string | null;
        cover_image_url: string | null;
        google_books_id: string | null;
      };
    };
    return {
      reviewId: item.id,
      content: item.content,
      createdAt: item.created_at,
      rating: ub.rating,
      googleBooksId: ub.books?.google_books_id ?? null,
      book: {
        title: ub.books?.title ?? "不明な書籍",
        author: ub.books?.author ?? null,
        coverImageUrl: ub.books?.cover_image_url ?? null,
      },
    };
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* プロフィールカード */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url ?? ""} alt={profile.username} />
              <AvatarFallback className="text-2xl">
                {profile.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center">
                <h1 className="text-xl font-bold">{profile.username}</h1>
                {!isOwnPage && (
                  <FollowButton
                    targetUserId={targetUserId}
                    isFollowing={isFollowing}
                    isLoggedIn={!!user}
                  />
                )}
              </div>

              {profile.bio && (
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                  {profile.bio}
                </p>
              )}

              <div className="mt-3 flex items-center justify-center gap-4 sm:justify-start">
                <div className="flex items-center gap-1 text-sm">
                  <UsersIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{followingResult.count ?? 0}</span>
                  <span className="text-muted-foreground">フォロー</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <span className="font-semibold">{followersResult.count ?? 0}</span>
                  <span className="text-muted-foreground">フォロワー</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* タブ: 本棚 / レビュー */}
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
          <UserBookshelf
            items={allBookshelfItems}
            canViewFull={canViewFull}
          />
        </TabsContent>
        <TabsContent value="reviews">
          <UserReviewList
            items={allReviewItems}
            canViewFull={canViewFull}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
