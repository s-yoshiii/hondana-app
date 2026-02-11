import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignupForm } from "@/components/signup-form";

export const metadata: Metadata = {
  title: "新規登録 | ホンダナ",
  description: "ホンダナに新規登録して、読書コミュニティに参加しましょう。",
};

export default function SignupPage() {
  return (
    <div className="flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">新規登録</CardTitle>
          <CardDescription>
            アカウントを作成して、読書コミュニティに参加しましょう
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            すでにアカウントをお持ちの方は{" "}
            <Link href="/login" className="text-primary underline underline-offset-4 hover:text-primary/80">
              ログイン
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
