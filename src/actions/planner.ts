"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/dal";
import { all, get, run } from "@/lib/db";
import { MEAL_TYPES, type ActionState } from "@/lib/types";

const PlanSchema = z.object({
  recipe_id: z.coerce.number().int().positive("Choose a recipe."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date."),
  meal_type: z.enum(MEAL_TYPES, "Choose a meal."),
});

export async function addToMealPlan(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = PlanSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };
  const { recipe_id, date, meal_type } = parsed.data;
  if (!get("SELECT id FROM recipes WHERE id = ?", recipe_id)) return { message: "That recipe no longer exists." };

  run("INSERT INTO meal_plans (user_id, recipe_id, date, meal_type) VALUES (?, ?, ?, ?)", [user.id, recipe_id, date, meal_type]);
  revalidatePath("/", "layout");
  return { ok: true, message: `Added to ${meal_type} on ${new Date(`${date}T00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })}.` };
}

export async function removeFromMealPlan(entryId: number) {
  const user = await requireUser();
  run("DELETE FROM meal_plans WHERE id = ? AND user_id = ?", [entryId, user.id]);
  revalidatePath("/planner");
}

/** Add every ingredient from the week's planned recipes to the shopping list. */
export async function addWeekToShoppingList(from: string, to: string) {
  const user = await requireUser();
  const ingredients = all<{ recipe_id: number; name: string; quantity: number | null; unit: string }>(
    `SELECT i.recipe_id, i.name, i.quantity, i.unit FROM meal_plans mp
     JOIN ingredients i ON i.recipe_id = mp.recipe_id
     WHERE mp.user_id = ? AND mp.date BETWEEN ? AND ? ORDER BY mp.date, i.position`,
    [user.id, from, to],
  );
  for (const ingredient of ingredients) {
    run("INSERT INTO shopping_items (user_id, recipe_id, name, quantity, unit) VALUES (?, ?, ?, ?, ?)", [
      user.id, ingredient.recipe_id, ingredient.name, ingredient.quantity, ingredient.unit,
    ]);
  }
  revalidatePath("/", "layout");
  return { added: ingredients.length };
}
