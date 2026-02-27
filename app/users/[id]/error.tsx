"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function UserError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-20">
      <h1 className="text-2xl font-bold">ユーザー情報の読み込みに失敗しました</h1>
      <p className="mt-2 text-muted-foreground">
        ユーザー情報の取得中にエラーが発生しました。
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>再試行する</Button>
        <Button variant="outline" asChild>
          <Link href="/">トップページへ</Link>
        </Button>
      </div>
    </div>
  );
}
