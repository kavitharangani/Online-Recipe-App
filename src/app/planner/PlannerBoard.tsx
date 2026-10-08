"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2, Plus, ShoppingCart, X } from "lucide-react";
import { addToMealPlan, addWeekToShoppingList, removeFromMealPlan } from "@/actions/planner";
import { FormMessage, SubmitButton } from "@/components/ui";
import { RecipeImage } from "@/components/RecipeImage";
import { formatMinutes } from "@/lib/format";
import { MEAL_TYPES, type MealPlanEntry, type MealType } from "@/lib/types";

const MEAL_EMOJI: Record<MealType, string> = { breakfast: "🌅", lunch: "☀️", dinner: "🌙", snack: "🍪" };

type Option = { id: number; title: string; favorite: boolean };

export function PlannerBoard({
  days,
  today,
  entries,
  options,
}: {
  days: string[];
  today: string;
  entries: MealPlanEntry[];
  options: Option[];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [slot, setSlot] = useState<{ date: string; meal: MealType } | null>(null);
  const [state, action] = useActionState(addToMealPlan, undefined);
  const [shopping, startShopping] = useTransition();
  const [shoppingMessage, setShoppingMessage] = useState("");

  useEffect(() => {
    if (state?.ok) dialog.current?.close();
  }, [state]);

  function open(date: string, meal: MealType) {
    setSlot({ date, meal });
    dialog.current?.showModal();
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500">{entries.length} meal{entries.length === 1 ? "" : "s"} planned this week</p>
        <div className="flex items-center gap-3">
          {shoppingMessage && (
            <span className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
              {shoppingMessage} <Link href="/shopping-list" className="underline">View list</Link>
            </span>
          )}
          <button
            type="button"
            disabled={!entries.length || shopping}
            className="btn-secondary"
            onClick={() =>
              startShopping(async () => {
                const { added } = await addWeekToShoppingList(days[0], days[6]);
                setShoppingMessage(`Added ${added} ingredients.`);
              })
            }
          >
            {shopping ? <Loader2 className="size-4 animate-spin" /> : <ShoppingCart className="size-4" />}
            Add week to shopping list
          </button>
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="grid min-w-[980px] grid-cols-7 gap-3">
          {days.map((day, dayIndex) => {
            const date = new Date(`${day}T00:00`);
            const isToday = day === today;
            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: -24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dayIndex * 0.05, type: "spring", stiffness: 200, damping: 20 }}
                className={`card flex flex-col overflow-hidden ${isToday ? "!border-brand-400 ring-2 ring-brand-200 dark:ring-brand-500/30" : ""}`}>
                <div className={`px-3 py-2.5 text-center ${isToday ? "bg-brand-500 text-white" : "bg-stone-50 dark:bg-stone-800/60"}`}>
                  <p className="text-xs font-semibold tracking-wider uppercase opacity-80">{date.toLocaleDateString("en-GB", { weekday: "short" })}</p>
                  <p className="font-display text-xl font-semibold">{date.getDate()}</p>
                </div>
                <div className="flex-1 space-y-3 p-2">
                  {MEAL_TYPES.map((meal) => {
                    const items = entries.filter((e) => e.date === day && e.meal_type === meal);
                    return (
                      <div key={meal}>
                        <p className="mb-1 px-1 text-[11px] font-semibold tracking-wide text-stone-400 uppercase">
                          {MEAL_EMOJI[meal]} {meal}
                        </p>
                        <div className="space-y-1.5">
                          <AnimatePresence initial={false}>
                            {items.map((item) => (
                              <PlannedItem key={item.id} item={item} />
                            ))}
                          </AnimatePresence>
                          <button
                            type="button"
                            onClick={() => open(day, meal)}
                            className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-stone-200 py-1.5 text-xs text-stone-400 transition hover:border-brand-400 hover:text-brand-600 dark:border-stone-700"
                            aria-label={`Add ${meal} on ${day}`}
                          >
                            <Plus className="size-3.5" /> Add
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <dialog
        ref={dialog}
        className="card m-auto w-full max-w-md p-0 text-stone-900 backdrop:bg-black/40 backdrop:backdrop-blur-sm dark:text-stone-100"
        onClick={(event) => event.target === dialog.current && dialog.current?.close()}
      >
        {slot && (
          <form action={action} className="space-y-4 p-6" key={`${slot.date}-${slot.meal}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold capitalize">
                {MEAL_EMOJI[slot.meal]} {slot.meal} ·{" "}
                {new Date(`${slot.date}T00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })}
              </h3>
              <button type="button" onClick={() => dialog.current?.close()} className="btn-ghost !p-1.5" aria-label="Close">
                <X className="size-4" />
              </button>
            </div>
            <input type="hidden" name="date" value={slot.date} />
            <input type="hidden" name="meal_type" value={slot.meal} />
            <div>
              <label htmlFor="recipe" className="label">Recipe</label>
              <select id="recipe" name="recipe_id" className="input" required defaultValue="">
                <option value="" disabled>Choose a recipe…</option>
                {options.some((o) => o.favorite) && (
                  <optgroup label="❤️ Favorites">
                    {options.filter((o) => o.favorite).map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}
                  </optgroup>
                )}
                <optgroup label="All recipes">
                  {options.filter((o) => !o.favorite).map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}
                </optgroup>
              </select>
            </div>
            <FormMessage state={state?.ok ? undefined : state} />
            <SubmitButton className="btn-primary w-full" pendingText="Adding…">Add to plan</SubmitButton>
          </form>
        )}
      </dialog>
    </>
  );
}

function PlannedItem({ item }: { item: MealPlanEntry }) {
  const [pending, startTransition] = useTransition();
  return (
    <motion.div
      layout
      className={`group relative flex items-center gap-2 rounded-lg bg-stone-50 p-1.5 dark:bg-stone-800 ${pending ? "opacity-40" : ""}`}
      initial={{ opacity: 0, scale: 0.6, rotate: -4 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 380, damping: 20 }}
    >
      <RecipeImage id={item.recipe_id} src={item.image} title={item.title} emoji={item.category_emoji} className="size-9 shrink-0 rounded-md" emojiClass="text-base" />
      <Link href={`/recipes/${item.recipe_id}`} className="min-w-0 flex-1">
        <p className="line-clamp-2 text-xs leading-tight font-medium hover:text-brand-600">{item.title}</p>
        <p className="text-[10px] text-stone-400">{formatMinutes(item.prep_time + item.cook_time)}</p>
      </Link>
      <button
        type="button"
        onClick={() => startTransition(() => removeFromMealPlan(item.id))}
        className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-white text-stone-500 opacity-0 shadow transition group-hover:opacity-100 hover:text-red-600 focus:opacity-100 dark:bg-stone-700"
        aria-label={`Remove ${item.title}`}
      >
        <X className="size-3" />
      </button>
    </motion.div>
  );
}
