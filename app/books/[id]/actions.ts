"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getBookByGoogleId } from "@/lib/google-books";

export type AddToBookshelfState = {
  errors?: {
    status?: string;
    rating?: string;
  };
  message?: string;
  success?: boolean;
};

const VALID_STATUSES = ["want_to_read", "reading", "completed", "stacked"];

export async function addToBookshelf(
  _prevState: AddToBookshelfState,
  formData: FormData,
): Promise<AddToBookshelfState> {
  const googleBooksId = formData.get("googleBooksId") as string;
  const status = formData.get("status") as string;
  const ratingStr = formData.get("rating") as string;
  const rating = ratingStr ? parseInt(ratingStr, 10) : null;

  // バリデーション
  const errors: AddToBookshelfState["errors"] = {};

  if (!status || !VALID_STATUSES.includes(status)) {
    errors.status = "読書ステータスを選択してください";
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

  // Google Books API から書籍情報取得
  const book = await getBookByGoogleId(googleBooksId);
  if (!book) {
    return { message: "書籍情報の取得に失敗しました" };
  }

  // ローカル DB に書籍が存在するか確認（google_books_id → isbn の順）
  let localBook: { id: string } | null = null;

  const { data: byGoogleId } = await supabase
    .from("books")
    .select("id")
    .eq("google_books_id", googleBooksId)
    .single();

  localBook = byGoogleId;

  if (!localBook && book.isbn) {
    const { data: byIsbn } = await supabase
      .from("books")
      .select("id")
      .eq("isbn", book.isbn)
      .single();
    localBook = byIsbn;
  }

  // 存在しなければ新規登録
  if (!localBook) {
    // Google Books API の publishedDate は "2024", "2024-01", "2024-01-15" など
    // 不完全な形式の場合があるため、DATE 型に変換できる形に正規化する
    let publishedDate: string | null = null;
    if (book.publishedDate) {
      const parts = book.publishedDate.split("-");
      if (parts.length === 1 && /^\d{4}$/.test(parts[0])) {
        publishedDate = `${parts[0]}-01-01`;
      } else if (parts.length === 2) {
        publishedDate = `${parts[0]}-${parts[1]}-01`;
      } else if (parts.length === 3) {
        publishedDate = book.publishedDate;
      }
    }

    const { data: inserted, error: insertError } = await supabase
      .from("books")
      .insert({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        cover_image_url: book.coverImageUrl,
        publisher: book.publisher,
        published_date: publishedDate,
        google_books_id: googleBooksId,
      })
      .select("id")
      .single();

    if (insertError) {
      // 他ユーザーが同時に登録した場合の重複エラー対応
      if (insertError.code === "23505") {
        const { data: retry } = await supabase
          .from("books")
          .select("id")
          .eq("google_books_id", googleBooksId)
          .single();
        localBook = retry;
      }
      if (!localBook) {
        console.error("books insert error:", insertError);
        return { message: `書籍の登録に失敗しました: ${insertError.message} (code: ${insertError.code})` };
      }
    } else {
      localBook = inserted;
    }
  }

  // user_books に upsert
  const { error: userBookError } = await supabase.from("user_books").upsert(
    {
      user_id: user.id,
      book_id: localBook.id,
      status: status as "want_to_read" | "reading" | "completed" | "stacked",
      rating,
    },
    { onConflict: "user_id,book_id" },
  );

  if (userBookError) {
    return { message: "本棚への追加に失敗しました" };
  }

  revalidatePath(`/books/${googleBooksId}`);
  return { success: true };
}
