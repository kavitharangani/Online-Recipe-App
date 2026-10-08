"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/dal";
import { all, get, run } from "@/lib/db";
import { deleteImage } from "@/lib/uploads";
import type { ActionState, Role } from "@/lib/types";

export async function setUserRole(userId: number, role: Role) {
  const admin = await requireAdmin();
  if (userId === admin.id) return { error: "You can't change your own role." };
  run("UPDATE users SET role = ? WHERE id = ?", [role === "admin" ? "admin" : "user", userId]);
  revalidatePath("/admin", "layout");
  return {};
}

export async function deleteUser(userId: number) {
  const admin = await requireAdmin();
  if (userId === admin.id) return { error: "Use Settings to delete your own account." };
  const user = get<{ avatar: string | null }>("SELECT avatar FROM users WHERE id = ?", userId);
  if (!user) return {};
  const images = all<{ image: string | null }>("SELECT image FROM recipes WHERE user_id = ?", userId);
  run("DELETE FROM users WHERE id = ?", userId);
  await Promise.all([...images.map((row) => deleteImage(row.image)), deleteImage(user.avatar)]);
  revalidatePath("/", "layout");
  return {};
}

export async function toggleFeatured(recipeId: number) {
  await requireAdmin();
  run("UPDATE recipes SET is_featured = 1 - is_featured WHERE id = ?", recipeId);
  revalidatePath("/", "layout");
}

export async function adminDeleteRecipe(recipeId: number) {
  await requireAdmin();
  const recipe = get<{ image: string | null }>("SELECT image FROM recipes WHERE id = ?", recipeId);
  if (!recipe) return;
  run("DELETE FROM recipes WHERE id = ?", recipeId);
  await deleteImage(recipe.image);
  revalidatePath("/", "layout");
}

const CategorySchema = z.object({
  id: z.coerce.number().int().optional(),
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(40, "Name is too long."),
  emoji: z.string().trim().min(1, "Pick an emoji.").max(8, "Use a single emoji."),
});

export async function saveCategory(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = CategorySchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    emoji: formData.get("emoji"),
  });
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };
  const { id, name, emoji } = parsed.data;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `category-${Date.now()}`;

  if (get("SELECT id FROM categories WHERE (name = ? OR slug = ?) AND id != ?", [name, slug, id ?? 0])) {
    return { errors: { name: ["A category with this name already exists."] } };
  }
  if (id) {
    run("UPDATE categories SET name = ?, slug = ?, emoji = ? WHERE id = ?", [name, slug, emoji, id]);
  } else {
    run("INSERT INTO categories (name, slug, emoji) VALUES (?, ?, ?)", [name, slug, emoji]);
  }
  revalidatePath("/", "layout");
  return { ok: true, message: id ? "Category updated." : "Category added." };
}

export async function deleteCategory(categoryId: number) {
  await requireAdmin();
  run("DELETE FROM categories WHERE id = ?", categoryId);
  revalidatePath("/", "layout");
}
