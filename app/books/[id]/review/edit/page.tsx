import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBookByGoogleId } from "@/lib/google-books";
import { ReviewForm } from "@/components/reviews/review-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "レビューを編集 | ホンダナ",
};

export default async function EditReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: googleBooksId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/books/${googleBooksId}/review/edit`);
  }

  const book = await getBookByGoogleId(googleBooksId);
  if (!book) {
    notFound();
  }

  // ローカル DB の書籍 → user_books → review を取得
  const { data: localBook } = await supabase
    .from("books")
    .select("id")
    .eq("google_books_id", googleBooksId)
    .single();

  if (!localBook) {
    notFound();
  }

  const { data: userBook } = await supabase
    .from("user_books")
    .select("id, rating")
    .eq("user_id", user.id)
    .eq("book_id", localBook.id)
    .single();

  if (!userBook) {
    notFound();
  }

  const { data: review } = await supabase
    .from("reviews")
    .select("id, content")
    .eq("user_book_id", userBook.id)
    .single();

  if (!review) {
    redirect(`/books/${googleBooksId}/review/new`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>「{book.title}」のレビューを編集</CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewForm
            googleBooksId={googleBooksId}
            isEdit
            reviewId={review.id}
            defaultContent={review.content}
            defaultRating={userBook.rating}
          />
        </CardContent>
      </Card>
    </div>
  );
}
