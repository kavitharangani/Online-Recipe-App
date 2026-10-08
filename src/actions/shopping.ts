"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import { all, get, run } from "@/lib/db";
import { parseQuantity } from "@/lib/format";
import type { ActionState } from "@/lib/types";

/**
 * Add a recipe's ingredients to the shopping list, scaled to the chosen servings.
 * Pass `only` to add a subset of ingredient ids.
 */
export async function addRecipeToShoppingList(recipeId: number, servings: number, only?: number[]) {
  const user = await requireUser();
  const recipe = get<{ servings: number }>("SELECT servings FROM recipes WHERE id = ?", recipeId);
  if (!recipe) return { added: 0 };
  const factor = servings > 0 ? servings / recipe.servings : 1;
  const ingredients = all<{ id: number; name: string; quantity: number | null; unit: string }>(
    "SELECT id, name, quantity, unit FROM ingredients WHERE recipe_id = ? ORDER BY position",
    recipeId,
  ).filter((ingredient) => !only || only.includes(ingredient.id));

  for (const ingredient of ingredients) {
    run("INSERT INTO shopping_items (user_id, recipe_id, name, quantity, unit) VALUES (?, ?, ?, ?, ?)", [
      user.id, recipeId, ingredient.name,
      ingredient.quantity === null ? null : Math.round(ingredient.quantity * factor * 100) / 100,
      ingredient.unit,
    ]);
  }
  revalidatePath("/", "layout");
  return { added: ingredients.length };
}

export async function addShoppingItem(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  if (!name) return { errors: { name: ["What do you need to buy?"] } };
  const quantity = parseQuantity(String(formData.get("quantity") ?? ""));
  if (Number.isNaN(quantity)) return { errors: { quantity: ["Use a number like 2, 1.5 or 1/2."] } };
  const unit = String(formData.get("unit") ?? "").trim().slice(0, 20);

  run("INSERT INTO shopping_items (user_id, name, quantity, unit) VALUES (?, ?, ?, ?)", [user.id, name, quantity, unit]);
  revalidatePath("/shopping-list");
  return { ok: true };
}

export async function toggleShoppingItem(itemId: number) {
  const user = await requireUser();
  run("UPDATE shopping_items SET checked = 1 - checked WHERE id = ? AND user_id = ?", [itemId, user.id]);
  revalidatePath("/shopping-list");
}

export async function deleteShoppingItem(itemId: number) {
  const user = await requireUser();
  run("DELETE FROM shopping_items WHERE id = ? AND user_id = ?", [itemId, user.id]);
  revalidatePath("/shopping-list");
}

export async function clearShoppingList(onlyChecked: boolean) {
  const user = await requireUser();
  run(`DELETE FROM shopping_items WHERE user_id = ? ${onlyChecked ? "AND checked = 1" : ""}`, user.id);
  revalidatePath("/", "layout");
}
