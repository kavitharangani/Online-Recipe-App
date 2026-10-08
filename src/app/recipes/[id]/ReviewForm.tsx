"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { submitReview } from "@/actions/recipes";
import { FieldError, FormMessage, SubmitButton } from "@/components/ui";

const LABELS = ["", "Not great", "It was OK", "Good", "Really good", "Absolutely loved it"];

export function ReviewForm({ recipeId, existing }: { recipeId: number; existing?: { rating: number; comment: string } }) {
  const [state, action] = useActionState(submitReview, undefined);
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const shown = hover || rating;

  return (
    <form action={action} className="card space-y-4 p-6">
      <h3 className="font-semibold">{existing ? "Update your review" : "Cooked this? Leave a review"}</h3>
      <input type="hidden" name="recipe_id" value={recipeId} />
      <input type="hidden" name="rating" value={rating} />
      <div className="flex items-center gap-3">
        <div className="flex" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={rating === star}
              aria-label={`${star} star${star === 1 ? "" : "s"}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              className="p-0.5 transition hover:scale-110"
            >
              <Star className={`size-7 ${shown >= star ? "fill-amber-400 text-amber-400" : "text-stone-300 dark:text-stone-600"}`} />
            </button>
          ))}
        </div>
        <span className="text-sm text-stone-500">{LABELS[shown]}</span>
      </div>
      <FieldError errors={state?.errors?.rating} />
      <div>
        <label htmlFor="comment" className="sr-only">Comment</label>
        <textarea
          id="comment"
          name="comment"
          rows={3}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="How did it turn out? Any tweaks you made?"
          className="input"
        />
        <FieldError errors={state?.errors?.comment} />
      </div>
      <FormMessage state={state} />
      <SubmitButton pendingText="Posting…">{existing ? "Update review" : "Post review"}</SubmitButton>
    </form>
  );
}
