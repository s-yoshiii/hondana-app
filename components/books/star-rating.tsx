import { StarIcon } from "lucide-react";

type StarRatingProps = {
  rating: number;
  size?: "sm" | "md";
};

export function StarRating({ rating, size = "sm" }: StarRatingProps) {
  const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={`${sizeClass} ${
            i < Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
}
