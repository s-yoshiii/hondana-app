import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-20">
      <p className="text-6xl font-bold text-muted-foreground">404</p>
      <h1 className="mt-4 text-2xl font-bold">ページが見つかりません</h1>
      <p className="mt-2 text-muted-foreground">
        お探しのページは存在しないか、削除された可能性があります。
      </p>
      <Button asChild className="mt-6">
        <Link href="/">トップページへ</Link>
      </Button>
    </div>
  );
}
