import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BookOpenIcon, MessageSquareIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProfileSection } from "@/components/mypage/profile-section";
import { BookshelfList } from "@/components/mypage/bookshelf-list";
import { MyReviewList } from "@/components/mypage/my-review-list";
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

  // フォロー数・フォロワー数・読了数・レビュー数・本棚データ・レビューデータを並列取得
  const [followingResult, followersResult, completedResult, reviewResult, bookshelfResult, myReviewsResult] =
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
      supabase
        .from("user_books")
        .select("id, status, rating, books(title, author, cover_image_url, google_books_id)")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false }),
      supabase
        .from("reviews")
        .select(
          "id, content, created_at, user_books!inner(rating, user_id, books!inner(title, author, cover_image_url, google_books_id))",
        )
        .eq("user_books.user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

  const myReviewItems = (myReviewsResult.data ?? []).map((item) => {
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

  const bookshelfItems = (bookshelfResult.data ?? []).map((item) => {
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
          <BookshelfList items={bookshelfItems} />
        </TabsContent>
        <TabsContent value="reviews">
          <MyReviewList items={myReviewItems} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
