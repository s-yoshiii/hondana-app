import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "ログイン | ホンダナ",
  description: "ホンダナにログインして、読書コミュニティを楽しみましょう。",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <div className="flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">ログイン</CardTitle>
          <CardDescription>
            メールアドレスとパスワードでログイン
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm redirectTo={redirectTo} />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            アカウントをお持ちでない方は{" "}
            <Link
              href="/signup"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              新規登録
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
