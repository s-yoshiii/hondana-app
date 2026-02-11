"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SignupState = {
  errors?: {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
  message?: string;
};

export async function signup(
  _prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // バリデーション
  const errors: SignupState["errors"] = {};

  if (!username || username.trim().length === 0) {
    errors.username = "ユーザー名を入力してください";
  } else if (username.trim().length > 50) {
    errors.username = "ユーザー名は50文字以内で入力してください";
  }

  if (!email || email.trim().length === 0) {
    errors.email = "メールアドレスを入力してください";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "正しいメールアドレスを入力してください";
  }

  if (!password) {
    errors.password = "パスワードを入力してください";
  } else if (password.length < 8) {
    errors.password = "パスワードは8文字以上で入力してください";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "パスワード（確認）を入力してください";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "パスワードが一致しません";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const supabase = await createClient();

  // Supabase Auth でユーザー作成（username をメタデータに保存）
  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username: username.trim() },
    },
  });

  if (authError) {
    return { message: authError.message };
  }

  if (!data.user) {
    return { message: "ユーザーの作成に失敗しました" };
  }

  // public.users テーブルにプロフィールレコード作成
  const { error: profileError } = await supabase.from("users").insert({
    id: data.user.id,
    username: username.trim(),
  });

  if (profileError) {
    return { message: "プロフィールの作成に失敗しました" };
  }

  redirect("/");
}
