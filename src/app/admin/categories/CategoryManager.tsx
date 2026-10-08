"use client";

import { useActionState, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { deleteCategory, saveCategory } from "@/actions/admin";
import { ConfirmButton, FieldError, FormMessage, SubmitButton } from "@/components/ui";
import type { Category } from "@/lib/types";

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [editing, setEditing] = useState<Category | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <ul className="card divide-y divide-stone-100 dark:divide-stone-800">
        {categories.map((category) => (
          <li key={category.id} className="flex items-center gap-4 px-4 py-3">
            <span className="text-2xl">{category.emoji}</span>
            <div className="flex-1">
              <p className="font-medium">{category.name}</p>
              <p className="text-xs text-stone-500">/{category.slug} · {category.recipe_count} recipes</p>
            </div>
            <button type="button" onClick={() => setEditing(category)} className="btn-ghost !p-2" aria-label={`Edit ${category.name}`}>
              <Pencil className="size-4" />
            </button>
            <ConfirmButton
              action={() => deleteCategory(category.id)}
              confirmText={`Delete "${category.name}"? Its ${category.recipe_count} recipe(s) will become uncategorised.`}
              className="btn-ghost !p-2 !text-red-600"
              title={`Delete ${category.name}`}
            >
              <Trash2 className="size-4" />
            </ConfirmButton>
          </li>
        ))}
      </ul>
      {/* Remount the form when switching between "add" and a specific category. */}
      <CategoryForm key={editing?.id ?? "new"} category={editing} onDone={() => setEditing(null)} />
    </div>
  );
}

function CategoryForm({ category, onDone }: { category: Category | null; onDone: () => void }) {
  const [state, action] = useActionState(saveCategory, undefined);
  return (
    <form action={action} className="card h-fit space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{category ? `Edit ${category.name}` : "Add a category"}</h2>
        {category && (
          <button type="button" onClick={onDone} className="btn-ghost !p-1.5" aria-label="Cancel editing">
            <X className="size-4" />
          </button>
        )}
      </div>
      {category && <input type="hidden" name="id" value={category.id} />}
      <div className="grid grid-cols-[80px_1fr] gap-3">
        <div>
          <label htmlFor="emoji" className="label">Emoji</label>
          <input id="emoji" name="emoji" defaultValue={category?.emoji ?? "🍽️"} className="input text-center text-lg" aria-invalid={!!state?.errors?.emoji} />
        </div>
        <div>
          <label htmlFor="cat-name" className="label">Name</label>
          <input id="cat-name" name="name" defaultValue={category?.name} placeholder="e.g. Seafood" className="input" aria-invalid={!!state?.errors?.name} />
        </div>
      </div>
      <FieldError errors={state?.errors?.name ?? state?.errors?.emoji} />
      <FormMessage state={state} />
      <SubmitButton className="btn-primary w-full" pendingText="Saving…">{category ? "Save changes" : "Add category"}</SubmitButton>
    </form>
  );
}
