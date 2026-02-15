import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBookByGoogleId } from "@/lib/google-books";
import { createClient } from "@/lib/supabase/server";
import { BookDetailInfo } from "@/components/books/book-detail-info";
import { AddToBookshelfButton } from "@/components/books/add-to-bookshelf-button";
import { ReviewList } from "@/components/reviews/review-list";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const book = await getBookByGoogleId(id);
  return {
    title: book
      ? `${book.title} | ホンダナ`
      : "書籍が見つかりません | ホンダナ",
  };
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: googleBooksId } = await params;
  const book = await getBookByGoogleId(googleBooksId);

  if (!book) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ローカル DB に書籍が存在するか確認
  const { data: localBook } = await supabase
    .from("books")
    .select("id")
    .eq("google_books_id", googleBooksId)
    .single();

  let averageRating: number | null = null;
  let ratingCount = 0;
  let userBookStatus: string | null = null;
  let userBookRating: number | null = null;
  let hasUserReview = false;

  // レビュー一覧用データ
  type ReviewItem = {
    id: string;
    content: string;
    createdAt: string;
    rating: number | null;
    reviewerUserId: string;
    reviewerName: string;
    reviewerAvatarUrl: string | null;
  };
  let reviews: ReviewItem[] = [];
  let followingUserIds: string[] = [];

  if (localBook) {
    const [ratingResult, userBookResult, reviewsResult] = await Promise.all([
      supabase
        .from("user_books")
        .select("rating")
        .eq("book_id", localBook.id)
        .not("rating", "is", null),
      user
        ? supabase
            .from("user_books")
            .select("status, rating")
            .eq("book_id", localBook.id)
            .eq("user_id", user.id)
            .single()
        : Promise.resolve({ data: null }),
      supabase
        .from("reviews")
        .select(
          "id, content, created_at, user_books!inner(user_id, rating, book_id, users!inner(username, avatar_url))",
        )
        .eq("user_books.book_id", localBook.id)
        .order("created_at", { ascending: false }),
    ]);

    if (ratingResult.data && ratingResult.data.length > 0) {
      const ratings = ratingResult.data.map((r) => r.rating!);
      averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      ratingCount = ratings.length;
    }

    if (userBookResult.data) {
      userBookStatus = userBookResult.data.status;
      userBookRating = userBookResult.data.rating;
    }

    // レビューデータを整形
    if (reviewsResult.data) {
      reviews = reviewsResult.data.map((r) => {
        const ub = r.user_books as unknown as {
          user_id: string;
          rating: number | null;
          users: { username: string; avatar_url: string | null };
        };
        return {
          id: r.id,
          content: r.content,
          createdAt: r.created_at,
          rating: ub.rating,
          reviewerUserId: ub.user_id,
          reviewerName: ub.users.username,
          reviewerAvatarUrl: ub.users.avatar_url,
        };
      });

      // 自分のレビューがあるか確認
      if (user) {
        hasUserReview = reviews.some((r) => r.reviewerUserId === user.id);
      }
    }

    // フォロー中ユーザーを取得（ログイン時のみ）
    if (user && reviews.length > 0) {
      const reviewerIds = reviews
        .filter((r) => r.reviewerUserId !== user.id)
        .map((r) => r.reviewerUserId);

      if (reviewerIds.length > 0) {
        const { data: followsData } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", user.id)
          .in("following_id", reviewerIds);

        followingUserIds = (followsData ?? []).map((f) => f.following_id);
      }
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <BookDetailInfo
        book={book}
        averageRating={averageRating}
        ratingCount={ratingCount}
      />

      {/* アクションボタン（認証済みのみ） */}
      {user && (
        <div className="mt-6">
          <AddToBookshelfButton
            googleBooksId={googleBooksId}
            currentStatus={userBookStatus}
            currentRating={userBookRating}
          />
        </div>
      )}

      {/* レビュー一覧 */}
      <ReviewList
        reviews={reviews}
        currentUserId={user?.id ?? null}
        followingUserIds={followingUserIds}
        googleBooksId={googleBooksId}
        canWriteReview={!!user && userBookStatus !== null && !hasUserReview}
      />
    </div>
  );
}
