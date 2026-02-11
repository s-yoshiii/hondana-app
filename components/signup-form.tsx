"use client";

import { useActionState } from "react";
import { LoaderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup, type SignupState } from "@/app/signup/actions";

const initialState: SignupState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, initialState);

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
          aria-describedby={state.errors?.username ? "username-error" : undefined}
        />
        {state.errors?.username && (
          <p id="username-error" className="text-sm text-destructive">
            {state.errors.username}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          aria-describedby={state.errors?.email ? "email-error" : undefined}
        />
        {state.errors?.email && (
          <p id="email-error" className="text-sm text-destructive">
            {state.errors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">パスワード</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="8文字以上"
          required
          minLength={8}
          aria-describedby={state.errors?.password ? "password-error" : undefined}
        />
        {state.errors?.password && (
          <p id="password-error" className="text-sm text-destructive">
            {state.errors.password}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">パスワード（確認）</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="パスワードを再入力"
          required
          minLength={8}
          aria-describedby={
            state.errors?.confirmPassword ? "confirmPassword-error" : undefined
          }
        />
        {state.errors?.confirmPassword && (
          <p id="confirmPassword-error" className="text-sm text-destructive">
            {state.errors.confirmPassword}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
        登録する
      </Button>
    </form>
  );
}
