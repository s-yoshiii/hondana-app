"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ReviewActionState = {
  errors?: {
    content?: string;
    rating?: string;
  };
  message?: string;
};

export async function submitReview(
  _prevState: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const googleBooksId = formData.get("googleBooksId") as string;
  const content = (formData.get("content") as string)?.trim();
  const ratingStr = formData.get("rating") as string;
  const rating = ratingStr ? parseInt(ratingStr, 10) : null;

  // バリデーション
  const errors: ReviewActionState["errors"] = {};

  if (!content) {
    errors.content = "レビュー内容を入力してください";
  } else if (content.length > 5000) {
    errors.content = "レビューは5000文字以内で入力してください";
  }

  if (rating !== null && (isNaN(rating) || rating < 1 || rating > 5)) {
    errors.rating = "評価は1〜5の範囲で選択してください";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "ログインが必要です" };
  }

  // ローカル DB の書籍を取得
  const { data: localBook } = await supabase
    .from("books")
    .select("id")
    .eq("google_books_id", googleBooksId)
    .single();

  if (!localBook) {
    return { message: "この書籍は本棚に登録されていません" };
  }

  // user_books レコードを取得
  const { data: userBook } = await supabase
    .from("user_books")
    .select("id")
    .eq("user_id", user.id)
    .eq("book_id", localBook.id)
    .single();

  if (!userBook) {
    return { message: "まず本棚に追加してからレビューを投稿してください" };
  }

  // レビューを作成
  const { error: reviewError } = await supabase.from("reviews").insert({
    user_book_id: userBook.id,
    content,
  });

  if (reviewError) {
    if (reviewError.code === "23505") {
      return { message: "この書籍のレビューは既に投稿されています" };
    }
    return { message: "レビューの投稿に失敗しました" };
  }

  // rating が指定されていれば user_books も更新
  if (rating !== null) {
    await supabase
      .from("user_books")
      .update({ rating })
      .eq("id", userBook.id);
  }

  revalidatePath(`/books/${googleBooksId}`);
  revalidatePath("/mypage");
  redirect(`/books/${googleBooksId}`);
}

export async function updateReview(
  _prevState: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const googleBooksId = formData.get("googleBooksId") as string;
  const reviewId = formData.get("reviewId") as string;
  const content = (formData.get("content") as string)?.trim();
  const ratingStr = formData.get("rating") as string;
  const rating = ratingStr ? parseInt(ratingStr, 10) : null;

  // バリデーション
  const errors: ReviewActionState["errors"] = {};

  if (!content) {
    errors.content = "レビュー内容を入力してください";
  } else if (content.length > 5000) {
    errors.content = "レビューは5000文字以内で入力してください";
  }

  if (rating !== null && (isNaN(rating) || rating < 1 || rating > 5)) {
    errors.rating = "評価は1〜5の範囲で選択してください";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "ログインが必要です" };
  }

  // レビューの所有者確認
  const { data: review } = await supabase
    .from("reviews")
    .select("id, user_book_id, user_books!inner(user_id)")
    .eq("id", reviewId)
    .single();

  if (!review) {
    return { message: "レビューが見つかりません" };
  }

  const userBooks = review.user_books as unknown as { user_id: string };
  if (userBooks.user_id !== user.id) {
    return { message: "このレビューを編集する権限がありません" };
  }

  // レビューを更新
  const { error: updateError } = await supabase
    .from("reviews")
    .update({ content })
    .eq("id", reviewId);

  if (updateError) {
    return { message: "レビューの更新に失敗しました" };
  }

  // rating を更新
  if (rating !== null) {
    await supabase
      .from("user_books")
      .update({ rating })
      .eq("id", review.user_book_id);
  }

  revalidatePath(`/books/${googleBooksId}`);
  revalidatePath("/mypage");
  redirect(`/books/${googleBooksId}`);
}

export async function deleteReview(formData: FormData): Promise<void> {
  const googleBooksId = formData.get("googleBooksId") as string;
  const reviewId = formData.get("reviewId") as string;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // レビューの所有者確認
  const { data: review } = await supabase
    .from("reviews")
    .select("id, user_books!inner(user_id)")
    .eq("id", reviewId)
    .single();

  if (!review) {
    redirect(`/books/${googleBooksId}`);
  }

  const userBooks = review.user_books as unknown as { user_id: string };
  if (userBooks.user_id !== user.id) {
    redirect(`/books/${googleBooksId}`);
  }

  await supabase.from("reviews").delete().eq("id", reviewId);

  revalidatePath(`/books/${googleBooksId}`);
  revalidatePath("/mypage");
  redirect(`/books/${googleBooksId}`);
}
