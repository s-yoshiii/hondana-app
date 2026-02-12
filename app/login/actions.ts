"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  errors?: {
    email?: string;
    password?: string;
  };
  message?: string;
};

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirectTo") as string | null;

  // バリデーション
  const errors: LoginState["errors"] = {};

  if (!email || email.trim().length === 0) {
    errors.email = "メールアドレスを入力してください";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "正しいメールアドレスを入力してください";
  }

  if (!password) {
    errors.password = "パスワードを入力してください";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { message: "メールアドレスまたはパスワードが正しくありません" };
  }

  redirect(redirectTo || "/");
}
