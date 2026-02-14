import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-16">
      <h1 className="text-2xl font-bold">書籍が見つかりません</h1>
      <p className="text-muted-foreground">
        指定された書籍は存在しないか、削除された可能性があります。
      </p>
      <Button asChild>
        <Link href="/">トップページに戻る</Link>
      </Button>
    </div>
  );
}
