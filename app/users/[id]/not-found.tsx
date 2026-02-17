import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UserNotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-20">
      <h1 className="text-2xl font-bold">ユーザーが見つかりません</h1>
      <p className="mt-2 text-muted-foreground">
        指定されたユーザーは存在しないか、削除された可能性があります。
      </p>
      <Button asChild className="mt-6">
        <Link href="/">トップページへ</Link>
      </Button>
    </div>
  );
}
