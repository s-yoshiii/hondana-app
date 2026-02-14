import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex flex-col gap-6 sm:flex-row">
        <Skeleton className="mx-auto h-[300px] w-[200px] shrink-0 rounded-lg sm:mx-0" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
    </div>
  );
}
