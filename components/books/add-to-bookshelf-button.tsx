"use client";

import { useActionState, useState } from "react";
import { BookPlusIcon, LoaderIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  addToBookshelf,
  type AddToBookshelfState,
} from "@/app/books/[id]/actions";
import { StatusSelector } from "@/components/books/status-selector";
import { StarRatingInput } from "@/components/books/star-rating-input";
import { BOOK_STATUS_LABELS } from "@/lib/constants";

type AddToBookshelfButtonProps = {
  googleBooksId: string;
  currentStatus: string | null;
  currentRating: number | null;
};

export function AddToBookshelfButton({
  googleBooksId,
  currentStatus,
  currentRating,
}: AddToBookshelfButtonProps) {
  const [open, setOpen] = useState(false);

  const handleAction = async (
    prevState: AddToBookshelfState,
    formData: FormData,
  ): Promise<AddToBookshelfState> => {
    const result = await addToBookshelf(prevState, formData);
    if (result.success) {
      setOpen(false);
      toast.success(
        currentStatus ? "読書ステータスを更新しました" : "本棚に追加しました",
      );
    }
    return result;
  };

  const [state, formAction, pending] = useActionState(handleAction, {});

  const isInBookshelf = currentStatus !== null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isInBookshelf ? (
          <Button variant="outline">
            {BOOK_STATUS_LABELS[currentStatus] ?? currentStatus}
          </Button>
        ) : (
          <Button>
            <BookPlusIcon className="mr-2 h-4 w-4" />
            本棚に追加
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isInBookshelf ? "読書ステータスを変更" : "本棚に追加"}
          </DialogTitle>
          <DialogDescription>
            読書ステータスと評価を設定してください
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="googleBooksId" value={googleBooksId} />

          {state.message && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {state.message}
            </div>
          )}

          <div className="space-y-2">
            <Label>読書ステータス</Label>
            <StatusSelector
              name="status"
              defaultValue={currentStatus ?? undefined}
            />
            {state.errors?.status && (
              <p className="text-sm text-destructive">{state.errors.status}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>評価（任意）</Label>
            <StarRatingInput name="rating" defaultValue={currentRating} />
            {state.errors?.rating && (
              <p className="text-sm text-destructive">{state.errors.rating}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
              {isInBookshelf ? "更新する" : "追加する"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
