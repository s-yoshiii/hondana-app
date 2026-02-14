import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBookByGoogleId } from "@/lib/google-books";
import { createClient } from "@/lib/supabase/server";
import { BookDetailInfo } from "@/components/books/book-detail-info";
import { AddToBookshelfButton } from "@/components/books/add-to-bookshelf-button";

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

  if (localBook) {
    const [ratingResult, userBookResult] = await Promise.all([
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

      {/* レビュー一覧（今後実装） */}
      <div className="mt-8">
        <h2 className="text-lg font-bold">レビュー</h2>
        <div className="mt-4 flex min-h-[120px] items-center justify-center rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">
            まだレビューはありません
          </p>
        </div>
      </div>
    </div>
  );
}
