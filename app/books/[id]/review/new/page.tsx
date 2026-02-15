import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBookByGoogleId } from "@/lib/google-books";
import { ReviewForm } from "@/components/reviews/review-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "レビューを書く | ホンダナ",
};

export default async function NewReviewPage({
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
    redirect(`/login?redirectTo=/books/${googleBooksId}/review/new`);
  }

  const book = await getBookByGoogleId(googleBooksId);
  if (!book) {
    notFound();
  }

  // ローカル DB の書籍 & user_books を確認
  const { data: localBook } = await supabase
    .from("books")
    .select("id")
    .eq("google_books_id", googleBooksId)
    .single();

  if (!localBook) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <p className="text-muted-foreground">
              レビューを書くには、まず本棚に追加してください
            </p>
            <Button asChild>
              <Link href={`/books/${googleBooksId}`}>書籍ページに戻る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: userBook } = await supabase
    .from("user_books")
    .select("id, rating")
    .eq("user_id", user.id)
    .eq("book_id", localBook.id)
    .single();

  if (!userBook) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <p className="text-muted-foreground">
              レビューを書くには、まず本棚に追加してください
            </p>
            <Button asChild>
              <Link href={`/books/${googleBooksId}`}>書籍ページに戻る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 既にレビュー済みなら編集ページへリダイレクト
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_book_id", userBook.id)
    .single();

  if (existingReview) {
    redirect(`/books/${googleBooksId}/review/edit`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>「{book.title}」のレビューを書く</CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewForm
            googleBooksId={googleBooksId}
            defaultRating={userBook.rating}
          />
        </CardContent>
      </Card>
    </div>
  );
}
