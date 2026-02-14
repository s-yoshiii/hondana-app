"use client";

import { useState } from "react";
import { StarIcon } from "lucide-react";

type StarRatingInputProps = {
  name: string;
  defaultValue?: number | null;
};

export function StarRatingInput({ name, defaultValue }: StarRatingInputProps) {
  const [rating, setRating] = useState(defaultValue ?? 0);
  const [hover, setHover] = useState(0);

  const handleClick = (star: number) => {
    setRating(rating === star ? 0 : star);
  };

  return (
    <div className="flex items-center gap-1">
      <input type="hidden" name={name} value={rating || ""} />
      {Array.from({ length: 5 }).map((_, i) => {
        const star = i + 1;
        const active = star <= (hover || rating);
        return (
          <button
            key={star}
            type="button"
            className="rounded p-0.5 transition-colors hover:bg-accent"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => handleClick(star)}
          >
            <StarIcon
              className={`h-6 w-6 ${
                active
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        );
      })}
      {rating > 0 && (
        <span className="ml-1 text-sm text-muted-foreground">{rating}.0</span>
      )}
    </div>
  );
}
