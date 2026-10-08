"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Loader2, Minus, Plus, ShoppingCart } from "lucide-react";
import { addRecipeToShoppingList } from "@/actions/shopping";
import { formatQuantity } from "@/lib/format";
import type { Ingredient } from "@/lib/types";

export function IngredientsPanel({
  recipeId,
  baseServings,
  ingredients,
  signedIn,
}: {
  recipeId: number;
  baseServings: number;
  ingredients: Ingredient[];
  signedIn: boolean;
}) {
  const router = useRouter();
  const [servings, setServings] = useState(baseServings);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const factor = servings / baseServings;

  function toggle(id: number) {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addToList() {
    if (!signedIn) {
      router.push(`/login?next=/recipes/${recipeId}`);
      return;
    }
    // Ticked ingredients are ones you already have, so only add the rest.
    const missing = ingredients.filter((ingredient) => !checked.has(ingredient.id)).map((ingredient) => ingredient.id);
    startTransition(async () => {
      const { added } = await addRecipeToShoppingList(recipeId, servings, missing);
      setMessage(added ? `Added ${added} item${added === 1 ? "" : "s"} to your shopping list.` : "Nothing to add — you have everything!");
    });
  }

  return (
    <div className="card sticky top-24 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold">Ingredients</h2>
        <div className="no-print flex items-center gap-1 rounded-xl border border-stone-200 p-1 dark:border-stone-700">
          <button
            type="button"
            onClick={() => setServings((s) => Math.max(1, s - 1))}
            className="grid size-7 place-items-center rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
            aria-label="Fewer servings"
          >
            <Minus className="size-3.5" />
          </button>
          <span className="w-20 text-center text-sm font-semibold" aria-live="polite">
            {servings} serving{servings === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            onClick={() => setServings((s) => Math.min(100, s + 1))}
            className="grid size-7 place-items-center rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
            aria-label="More servings"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>
      {servings !== baseServings && (
        <p className="mt-2 text-xs text-brand-600">
          Scaled from {baseServings} serving{baseServings === 1 ? "" : "s"}.{" "}
          <button type="button" className="underline" onClick={() => setServings(baseServings)}>Reset</button>
        </p>
      )}

      <ul className="mt-5 divide-y divide-stone-100 dark:divide-stone-800">
        {ingredients.map((ingredient, index) => {
          const done = checked.has(ingredient.id);
          const quantity = ingredient.quantity === null ? "" : formatQuantity(ingredient.quantity * factor);
          return (
            <motion.li
              key={ingredient.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
            >
              <label className="flex cursor-pointer items-start gap-3 py-2.5">
                <input type="checkbox" checked={done} onChange={() => toggle(ingredient.id)} className="peer sr-only" />
                <span
                  className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 ${
                    done ? "border-brand-500 bg-brand-500 text-white" : "border-stone-300 dark:border-stone-600"
                  }`}
                >
                  <AnimatePresence>
                    {done && (
                      <motion.span
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 90 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                      >
                        <Check className="size-3.5" strokeWidth={3} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
                <span className={`text-sm transition-colors ${done ? "text-stone-400 line-through" : ""}`}>
                  {quantity && (
                    // Re-keyed on change so scaled amounts flip in when servings change.
                    <motion.strong key={quantity} className="inline-block font-semibold" initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                      {quantity}&nbsp;
                    </motion.strong>
                  )}
                  {ingredient.unit && <span className="font-medium">{ingredient.unit} </span>}
                  {ingredient.name}
                </span>
              </label>
            </motion.li>
          );
        })}
      </ul>

      <div className="no-print mt-4 border-t border-stone-100 pt-4 dark:border-stone-800">
        <p className="mb-3 text-xs text-stone-500">Tick what you already have — the rest goes on your list.</p>
        <button type="button" onClick={addToList} disabled={pending} className="btn-secondary w-full">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <ShoppingCart className="size-4" />}
          Add to shopping list
        </button>
        {message && (
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="mt-2 text-center text-xs font-medium text-emerald-700 dark:text-emerald-400"
            role="status"
          >
            {message}{" "}
            <Link href="/shopping-list" className="underline">View list</Link>
          </motion.p>
        )}
      </div>
    </div>
  );
}
