import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* プロフィールセクション */}
      <div className="rounded-lg border p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <Skeleton className="h-20 w-20 shrink-0 rounded-full" />
          <div className="flex w-full flex-col items-center gap-2 sm:items-start">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-64" />
            <div className="mt-1 flex gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="mt-2 flex gap-6">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      </div>

      {/* タブ */}
      <div className="mt-6">
        <Skeleton className="h-10 w-full rounded-md" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 rounded-lg border p-4">
              <Skeleton className="h-[90px] w-[60px] shrink-0 rounded" />
              <div className="flex flex-col justify-center gap-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
