"use client";

import { useActionState } from "react";
import { LoaderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StarRatingInput } from "@/components/books/star-rating-input";
import {
  submitReview,
  updateReview,
  deleteReview,
  type ReviewActionState,
} from "@/app/books/[id]/review/actions";

type ReviewFormProps = {
  googleBooksId: string;
  isEdit?: boolean;
  reviewId?: string;
  defaultContent?: string;
  defaultRating?: number | null;
};

export function ReviewForm({
  googleBooksId,
  isEdit = false,
  reviewId,
  defaultContent = "",
  defaultRating = null,
}: ReviewFormProps) {
  const action = isEdit ? updateReview : submitReview;
  const [state, formAction, pending] = useActionState<
    ReviewActionState,
    FormData
  >(action, {});

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="googleBooksId" value={googleBooksId} />
        {isEdit && reviewId && (
          <input type="hidden" name="reviewId" value={reviewId} />
        )}

        {state.message && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {state.message}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="rating">評価</Label>
          <StarRatingInput name="rating" defaultValue={defaultRating} />
          {state.errors?.rating && (
            <p className="text-sm text-destructive">{state.errors.rating}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">レビュー内容</Label>
          <Textarea
            id="content"
            name="content"
            placeholder="この本の感想を書いてください..."
            defaultValue={defaultContent}
            rows={8}
            maxLength={5000}
          />
          {state.errors?.content && (
            <p className="text-sm text-destructive">{state.errors.content}</p>
          )}
          <p className="text-xs text-muted-foreground">最大5000文字</p>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={pending}>
            {pending && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "更新する" : "投稿する"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <a href={`/books/${googleBooksId}`}>キャンセル</a>
          </Button>
        </div>
      </form>

      {isEdit && reviewId && (
        <form action={deleteReview}>
          <input type="hidden" name="googleBooksId" value={googleBooksId} />
          <input type="hidden" name="reviewId" value={reviewId} />
          <Button type="submit" variant="destructive" size="sm">
            レビューを削除する
          </Button>
        </form>
      )}
    </div>
  );
}
