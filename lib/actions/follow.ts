"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function followUser(targetUserId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です" };
  }

  if (user.id === targetUserId) {
    return { error: "自分自身をフォローすることはできません" };
  }

  const { error } = await supabase.from("follows").insert({
    follower_id: user.id,
    following_id: targetUserId,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "既にフォローしています" };
    }
    return { error: "フォローに失敗しました" };
  }

  revalidatePath("/mypage");
  return {};
}

export async function unfollowUser(targetUserId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です" };
  }

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId);

  if (error) {
    return { error: "フォロー解除に失敗しました" };
  }

  revalidatePath("/mypage");
  return {};
}
