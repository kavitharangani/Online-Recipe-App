import { Star } from "lucide-react";

export function Stars({ rating, size = "size-4" }: { rating: number | null; size?: string }) {
  const value = rating ?? 0;
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={rating ? `${rating} out of 5 stars` : "No ratings yet"}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${
            value >= star - 0.25
              ? "fill-amber-400 text-amber-400"
              : value >= star - 0.75
                ? "fill-amber-400/50 text-amber-400"
                : "fill-stone-200 text-stone-200 dark:fill-stone-700 dark:text-stone-700"
          }`}
        />
      ))}
    </span>
  );
}
