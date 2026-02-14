"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ProfileEditState = {
  errors?: {
    username?: string;
    bio?: string;
  };
  message?: string;
};

export async function updateProfile(
  _prevState: ProfileEditState,
  formData: FormData,
): Promise<ProfileEditState> {
  const username = formData.get("username") as string;
  const bio = formData.get("bio") as string;

  // バリデーション
  const errors: ProfileEditState["errors"] = {};

  if (!username || username.trim().length === 0) {
    errors.username = "ユーザー名を入力してください";
  } else if (username.trim().length > 50) {
    errors.username = "ユーザー名は50文字以内で入力してください";
  }

  if (bio && bio.length > 500) {
    errors.bio = "自己紹介は500文字以内で入力してください";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "認証に失敗しました。再度ログインしてください。" };
  }

  const { error } = await supabase
    .from("users")
    .update({
      username: username.trim(),
      bio: bio?.trim() || null,
    })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { errors: { username: "このユーザー名は既に使用されています" } };
    }
    return { message: "プロフィールの更新に失敗しました" };
  }

  redirect("/mypage");
}
