"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { CalendarPlus, X } from "lucide-react";
import { addToMealPlan } from "@/actions/planner";
import { FieldError, FormMessage, SubmitButton } from "@/components/ui";
import { MEAL_TYPES } from "@/lib/types";

export function AddToPlanButton({ recipeId, signedIn, today }: { recipeId: number; signedIn: boolean; today: string }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, action] = useActionState(addToMealPlan, undefined);
  const [date, setDate] = useState(today);
  const [meal, setMeal] = useState("dinner");

  useEffect(() => {
    if (state?.ok) {
      const timeout = setTimeout(() => dialog.current?.close(), 1400);
      return () => clearTimeout(timeout);
    }
  }, [state]);

  return (
    <>
      <button
        type="button"
        className="btn-secondary"
        onClick={() => (signedIn ? dialog.current?.showModal() : router.push(`/login?next=/recipes/${recipeId}`))}
      >
        <CalendarPlus className="size-4" /> Plan it
      </button>
      <dialog
        ref={dialog}
        className="card m-auto w-full max-w-sm p-0 text-stone-900 backdrop:bg-black/40 backdrop:backdrop-blur-sm dark:text-stone-100"
        onClick={(event) => event.target === dialog.current && dialog.current?.close()}
      >
        <form action={action} className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-semibold">Add to meal plan</h3>
            <button type="button" onClick={() => dialog.current?.close()} aria-label="Close" className="btn-ghost !p-1.5">
              <X className="size-4" />
            </button>
          </div>
          <input type="hidden" name="recipe_id" value={recipeId} />
          <div>
            <label htmlFor="plan-date" className="label">Day</label>
            <input id="plan-date" type="date" name="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} required />
            <FieldError errors={state?.errors?.date} />
          </div>
          <div>
            <span className="label">Meal</span>
            <div className="grid grid-cols-2 gap-2">
              {MEAL_TYPES.map((type) => (
                <label
                  key={type}
                  className={`cursor-pointer rounded-xl border px-3 py-2 text-center text-sm font-medium capitalize transition ${
                    meal === type
                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                      : "border-stone-200 hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800"
                  }`}
                >
                  <input type="radio" name="meal_type" value={type} checked={meal === type} onChange={() => setMeal(type)} className="sr-only" />
                  {type}
                </label>
              ))}
            </div>
          </div>
          <FormMessage state={state} />
          <SubmitButton className="btn-primary w-full" pendingText="Adding…">Add to plan</SubmitButton>
        </form>
      </dialog>
    </>
  );
}
