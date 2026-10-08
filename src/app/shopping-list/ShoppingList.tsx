"use client";

import Link from "next/link";
import { useActionState, useOptimistic, useRef, useState, useTransition } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { Check, Copy, Plus, Printer, Trash2, X } from "lucide-react";
import { addShoppingItem, clearShoppingList, deleteShoppingItem, toggleShoppingItem } from "@/actions/shopping";
import { ConfirmButton, FieldError, SubmitButton } from "@/components/ui";
import { EmptyStateInline } from "./EmptyStateInline";
import { formatQuantity } from "@/lib/format";
import type { ShoppingItem } from "@/lib/types";

type Group = { key: string; title: string; recipeId: number | null; items: ShoppingItem[] };

export function ShoppingList({ items }: { items: ShoppingItem[] }) {
  const [state, action] = useActionState(addShoppingItem, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const [view, setView] = useState<"recipe" | "combined">("recipe");
  const [copied, setCopied] = useState(false);
  const [optimistic, toggleOptimistic] = useOptimistic(items, (current, id: number) =>
    current.map((item) => (item.id === id ? { ...item, checked: item.checked ? 0 : 1 } : item)),
  );
  const [, startTransition] = useTransition();

  const toggle = (id: number) =>
    startTransition(async () => {
      toggleOptimistic(id);
      await toggleShoppingItem(id);
    });

  const groups: Group[] = [];
  if (view === "recipe") {
    for (const item of optimistic) {
      const key = item.recipe_id ? `r${item.recipe_id}` : "custom";
      let group = groups.find((g) => g.key === key);
      if (!group) {
        group = { key, title: item.recipe_title ?? "Other items", recipeId: item.recipe_id, items: [] };
        groups.push(group);
      }
      group.items.push(item);
    }
  } else {
    // Merge identical ingredients (same name + unit) across recipes into one line.
    const merged = new Map<string, ShoppingItem & { ids: number[] }>();
    for (const item of optimistic) {
      const key = `${item.name.toLowerCase().trim()}|${item.unit.toLowerCase()}|${item.checked}`;
      const existing = merged.get(key);
      if (existing) {
        existing.ids.push(item.id);
        existing.quantity = existing.quantity !== null && item.quantity !== null ? existing.quantity + item.quantity : existing.quantity ?? item.quantity;
      } else {
        merged.set(key, { ...item, ids: [item.id] });
      }
    }
    groups.push({ key: "all", title: "All items", recipeId: null, items: [...merged.values()] });
  }

  const hasChecked = optimistic.some((item) => item.checked);

  async function copyList() {
    const text = optimistic
      .filter((item) => !item.checked)
      .map((item) => `• ${[formatQuantity(item.quantity), item.unit, item.name].filter(Boolean).join(" ")}`)
      .join("\n");
    await navigator.clipboard.writeText(text || "Nothing left to buy!");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <form
        ref={formRef}
        action={action}
        className="card no-print grid grid-cols-[80px_90px_1fr_auto] gap-2 p-3"
      >
        <input name="quantity" placeholder="Qty" className="input" aria-label="Quantity" />
        <input name="unit" placeholder="Unit" className="input" aria-label="Unit" />
        <input name="name" placeholder="Add an item, e.g. eggs" className="input" aria-label="Item" aria-invalid={!!state?.errors?.name} />
        <SubmitButton className="btn-primary !px-3"><Plus className="size-4" /><span className="sr-only sm:not-sr-only">Add</span></SubmitButton>
        <div className="col-span-4">
          <FieldError errors={state?.errors?.name ?? state?.errors?.quantity} />
        </div>
      </form>

      {optimistic.length === 0 ? (
        <EmptyStateInline />
      ) : (
        <>
          <div className="no-print flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl border border-stone-200 p-1 text-sm dark:border-stone-700">
              {(["recipe", "combined"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setView(mode)}
                  className={`rounded-lg px-3 py-1.5 font-medium ${view === mode ? "bg-brand-500 text-white" : "text-stone-600 dark:text-stone-300"}`}
                >
                  {mode === "recipe" ? "By recipe" : "Combined"}
                </button>
              ))}
            </div>
            <div className="ml-auto flex gap-2">
              <button type="button" onClick={copyList} className="btn-ghost">
                {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />} {copied ? "Copied" : "Copy"}
              </button>
              <button type="button" onClick={() => window.print()} className="btn-ghost"><Printer className="size-4" /> Print</button>
              {hasChecked && (
                <ConfirmButton action={() => clearShoppingList(true)} confirmText="Remove all ticked items?" className="btn-ghost">
                  <Check className="size-4" /> Clear ticked
                </ConfirmButton>
              )}
              <ConfirmButton action={() => clearShoppingList(false)} confirmText="Empty your whole shopping list?" className="btn-ghost !text-red-600">
                <Trash2 className="size-4" /> Clear all
              </ConfirmButton>
            </div>
          </div>

          <LayoutGroup>
          {groups.map((group) => (
            <motion.section
              layout
              key={group.key}
              className="card overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="border-b border-stone-100 bg-stone-50 px-4 py-2.5 text-sm font-semibold dark:border-stone-800 dark:bg-stone-800/50">
                {group.recipeId ? <Link href={`/recipes/${group.recipeId}`} className="hover:text-brand-600">{group.title}</Link> : group.title}
                <span className="ml-2 font-normal text-stone-400">{group.items.filter((i) => !i.checked).length} left</span>
              </h2>
              <ul className="divide-y divide-stone-100 dark:divide-stone-800">
                <AnimatePresence initial={false}>
                {group.items.map((item) => {
                  const ids = "ids" in item ? (item.ids as number[]) : [item.id];
                  return (
                    <motion.li
                      layout
                      key={item.id}
                      className="group flex items-center gap-3 px-4 py-2.5"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -80, height: 0, paddingTop: 0, paddingBottom: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 34 }}
                    >
                      <button
                        type="button"
                        onClick={() => ids.forEach(toggle)}
                        className={`grid size-5 shrink-0 place-items-center rounded-md border-2 transition ${
                          item.checked ? "border-emerald-500 bg-emerald-500 text-white" : "border-stone-300 hover:border-brand-400 dark:border-stone-600"
                        }`}
                        aria-label={item.checked ? `Untick ${item.name}` : `Tick ${item.name}`}
                        aria-pressed={!!item.checked}
                      >
                        {item.checked ? (
                          <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                            {/* The tick draws itself in. */}
                            <motion.path d="M5 12l5 5L20 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3 }} />
                          </svg>
                        ) : null}
                      </button>
                      <span className={`flex-1 text-sm ${item.checked ? "text-stone-400 line-through" : ""}`}>
                        {item.quantity !== null && <strong>{formatQuantity(item.quantity)} </strong>}
                        {item.unit && <span>{item.unit} </span>}
                        {item.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => startTransition(async () => { for (const id of ids) await deleteShoppingItem(id); })}
                        className="no-print rounded-lg p-1 text-stone-400 opacity-0 transition group-hover:opacity-100 hover:text-red-600 focus:opacity-100"
                        aria-label={`Remove ${item.name}`}
                      >
                        <X className="size-4" />
                      </button>
                    </motion.li>
                  );
                })}
                </AnimatePresence>
              </ul>
            </motion.section>
          ))}
          </LayoutGroup>
        </>
      )}
    </div>
  );
}
