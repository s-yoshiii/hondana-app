import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileEditForm } from "@/components/mypage/profile-edit-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "プロフィール編集 | ホンダナ",
  description: "プロフィール情報を編集します",
};

export default async function ProfileEditPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("username, bio")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>プロフィール編集</CardTitle>
          <CardDescription>
            プロフィール情報を更新できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileEditForm
            defaultValues={{
              username: profile.username,
              bio: profile.bio ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
