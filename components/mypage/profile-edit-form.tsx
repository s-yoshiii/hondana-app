"use client";

import { useActionState } from "react";
import Link from "next/link";
import { LoaderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateProfile,
  type ProfileEditState,
} from "@/app/mypage/edit/actions";

type ProfileEditFormProps = {
  defaultValues: {
    username: string;
    bio: string;
  };
};

const initialState: ProfileEditState = {};

export function ProfileEditForm({ defaultValues }: ProfileEditFormProps) {
  const [state, formAction, pending] = useActionState(
    updateProfile,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.message && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.message}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="username">ユーザー名</Label>
        <Input
          id="username"
          name="username"
          type="text"
          placeholder="your_username"
          required
          maxLength={50}
          defaultValue={defaultValues.username}
          aria-describedby={
            state.errors?.username ? "username-error" : undefined
          }
        />
        {state.errors?.username && (
          <p id="username-error" className="text-sm text-destructive">
            {state.errors.username}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">自己紹介</Label>
        <textarea
          id="bio"
          name="bio"
          placeholder="自己紹介を入力してください"
          maxLength={500}
          rows={4}
          defaultValue={defaultValues.bio}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          aria-describedby={state.errors?.bio ? "bio-error" : undefined}
        />
        {state.errors?.bio && (
          <p id="bio-error" className="text-sm text-destructive">
            {state.errors.bio}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
          保存する
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/mypage">キャンセル</Link>
        </Button>
      </div>
    </form>
  );
}
