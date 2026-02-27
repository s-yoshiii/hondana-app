"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-20">
      <p className="text-6xl font-bold text-muted-foreground">500</p>
      <h1 className="mt-4 text-2xl font-bold">エラーが発生しました</h1>
      <p className="mt-2 text-muted-foreground">
        予期しないエラーが発生しました。しばらく経ってから再度お試しください。
      </p>
      <Button onClick={reset} className="mt-6">
        再試行する
      </Button>
    </div>
  );
}
