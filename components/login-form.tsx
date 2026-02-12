"use client";

import { useActionState } from "react";
import { LoaderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, type LoginState } from "@/app/login/actions";

const initialState: LoginState = {};

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {redirectTo && (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      )}

      {state.message && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.message}
        </div>
      )}

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
          placeholder="パスワードを入力"
          required
          aria-describedby={
            state.errors?.password ? "password-error" : undefined
          }
        />
        {state.errors?.password && (
          <p id="password-error" className="text-sm text-destructive">
            {state.errors.password}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
        ログイン
      </Button>
    </form>
  );
}
