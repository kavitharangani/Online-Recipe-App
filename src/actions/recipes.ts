"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/dal";
import { all, get, run, transaction } from "@/lib/db";
import { parseQuantity } from "@/lib/format";
import { notify } from "@/lib/notify";
import { deleteImage, hasFile, saveImage, validateImage } from "@/lib/uploads";
import { DIFFICULTIES, type ActionState, type User } from "@/lib/types";

const RecipeSchema = z.object({
  title: z.string().trim().min(3, "Give your recipe a title (3+ characters).").max(120, "Title is too long."),
  description: z.string().trim().min(10, "Add a short description (10+ characters).").max(1000, "Description is too long."),
  category_id: z.coerce.number().int().positive("Choose a category."),
  cuisine: z.string().trim().max(40, "Cuisine is too long."),
  difficulty: z.enum(DIFFICULTIES, "Choose a difficulty."),
  prep_time: z.coerce.number().int("Whole minutes only.").min(0, "Can't be negative.").max(1440, "That's over a day!"),
  cook_time: z.coerce.number().int("Whole minutes only.").min(0, "Can't be negative.").max(1440, "That's over a day!"),
  servings: z.coerce.number().int("Whole number please.").min(1, "At least 1 serving.").max(100, "Maximum 100 servings."),
  calories: z.union([z.literal(""), z.coerce.number().int().min(0).max(10000)]).transform((v) => (v === "" ? null : v)),
  tags: z.string().trim().max(200, "Too many tags."),
  tips: z.string().trim().max(1000, "Tips are too long."),
});

function canManage(user: User, ownerId: number) {
  return user.role === "admin" || user.id === ownerId;
}

function readIngredients(formData: FormData) {
  const quantities = formData.getAll("ing_qty").map(String);
  const units = formData.getAll("ing_unit").map(String);
  const names = formData.getAll("ing_name").map(String);
  const ingredients: { quantity: number | null; unit: string; name: string }[] = [];
  let error: string | undefined;
  names.forEach((rawName, index) => {
    const name = rawName.trim();
    if (!name) return;
    const quantity = parseQuantity(quantities[index] ?? "");
    if (Number.isNaN(quantity)) error = `"${quantities[index]}" isn't a valid amount for ${name}. Use numbers like 2, 1.5 or 1/2.`;
    ingredients.push({ quantity, unit: (units[index] ?? "").trim().slice(0, 20), name: name.slice(0, 120) });
  });
  if (!error && ingredients.length === 0) error = "Add at least one ingredient.";
  return { ingredients, error };
}

function readSteps(formData: FormData) {
  const texts = formData.getAll("step_text").map(String);
  const timers = formData.getAll("step_timer").map(String);
  const steps = texts
    .map((text, index) => {
      const timer = Number(timers[index]);
      return {
        instruction: text.trim().slice(0, 2000),
        timer: Number.isInteger(timer) && timer > 0 && timer <= 600 ? timer : null,
      };
    })
    .filter((step) => step.instruction);
  return { steps, error: steps.length === 0 ? "Add at least one step." : undefined };
}

export async function saveRecipe(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const id = Number(formData.get("id")) || null;

  let existing: { user_id: number; image: string | null } | undefined;
  if (id) {
    existing = get("SELECT user_id, image FROM recipes WHERE id = ?", id);
    if (!existing) return { message: "This recipe no longer exists." };
    if (!canManage(user, existing.user_id)) return { message: "You can only edit your own recipes." };
  }

  const parsed = RecipeSchema.safeParse(Object.fromEntries(formData));
  const ingredients = readIngredients(formData);
  const steps = readSteps(formData);
  const errors: Record<string, string[] | undefined> = parsed.success ? {} : z.flattenError(parsed.error).fieldErrors;
  if (ingredients.error) errors.ingredients = [ingredients.error];
  if (steps.error) errors.steps = [steps.error];

  const file = formData.get("image");
  if (hasFile(file)) {
    const imageError = validateImage(file);
    if (imageError) errors.image = [imageError];
  }
  if (!parsed.success || Object.keys(errors).length) {
    return { errors, message: "Please fix the highlighted fields." };
  }
  const data = parsed.data;
  if (!get("SELECT id FROM categories WHERE id = ?", data.category_id)) {
    return { errors: { category_id: ["Choose a category."] } };
  }

  let image = existing?.image ?? null;
  if (hasFile(file)) {
    image = await saveImage(file);
    await deleteImage(existing?.image);
  } else if (formData.get("remove_image") === "on") {
    await deleteImage(existing?.image);
    image = null;
  }

  const tags = data.tags.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean).join(",");
  const values = [
    data.title, data.description, data.category_id, data.cuisine, data.difficulty, data.prep_time,
    data.cook_time, data.servings, data.calories, tags, data.tips, image,
  ];

  const recipeId = transaction(() => {
    let recipeId: number;
    if (id) {
      run(
        `UPDATE recipes SET title = ?, description = ?, category_id = ?, cuisine = ?, difficulty = ?, prep_time = ?,
           cook_time = ?, servings = ?, calories = ?, tags = ?, tips = ?, image = ?, updated_at = datetime('now')
         WHERE id = ?`,
        [...values, id],
      );
      run("DELETE FROM ingredients WHERE recipe_id = ?", id);
      run("DELETE FROM steps WHERE recipe_id = ?", id);
      recipeId = id;
    } else {
      recipeId = run(
        `INSERT INTO recipes (title, description, category_id, cuisine, difficulty, prep_time, cook_time, servings,
           calories, tags, tips, image, user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [...values, user.id],
      ).id;
    }
    ingredients.ingredients.forEach((ingredient, position) => {
      run("INSERT INTO ingredients (recipe_id, position, quantity, unit, name) VALUES (?, ?, ?, ?, ?)", [
        recipeId, position, ingredient.quantity, ingredient.unit, ingredient.name,
      ]);
    });
    steps.steps.forEach((step, position) => {
      run("INSERT INTO steps (recipe_id, position, instruction, timer_minutes) VALUES (?, ?, ?, ?)", [
        recipeId, position, step.instruction, step.timer,
      ]);
    });
    return recipeId;
  });

  if (!id) {
    // Let followers know there's something new to cook.
    const followers = all<{ follower_id: number }>("SELECT follower_id FROM follows WHERE following_id = ?", user.id);
    for (const { follower_id } of followers) {
      notify({
        userId: follower_id, actorId: user.id, recipeId, type: "new_recipe",
        message: `${user.name} shared a new recipe: ${data.title}`,
      });
    }
  }

  revalidatePath("/", "layout");
  redirect(`/recipes/${recipeId}?saved=1`);
}

export async function deleteRecipe(recipeId: number) {
  const user = await requireUser();
  const recipe = get<{ user_id: number; image: string | null }>("SELECT user_id, image FROM recipes WHERE id = ?", recipeId);
  if (!recipe || !canManage(user, recipe.user_id)) return;
  run("DELETE FROM recipes WHERE id = ?", recipeId);
  await deleteImage(recipe.image);
  revalidatePath("/", "layout");
  redirect(user.role === "admin" && user.id !== recipe.user_id ? "/admin/recipes" : "/my-recipes?deleted=1");
}

export async function toggleFavorite(recipeId: number): Promise<{ favorited: boolean }> {
  const user = await requireUser();
  const recipe = get<{ user_id: number; title: string }>("SELECT user_id, title FROM recipes WHERE id = ?", recipeId);
  if (!recipe) return { favorited: false };

  const removed = run("DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?", [user.id, recipeId]).changes > 0;
  if (!removed) {
    run("INSERT INTO favorites (user_id, recipe_id) VALUES (?, ?)", [user.id, recipeId]);
    notify({
      userId: recipe.user_id, actorId: user.id, recipeId, type: "favorite",
      message: `${user.name} saved your recipe ${recipe.title}`,
    });
  }
  revalidatePath("/", "layout");
  return { favorited: !removed };
}

const ReviewSchema = z.object({
  recipe_id: z.coerce.number().int().positive(),
  rating: z.coerce.number().int().min(1, "Pick a star rating.").max(5, "Pick a star rating."),
  comment: z.string().trim().max(1000, "Keep reviews under 1000 characters."),
});

export async function submitReview(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = ReviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };

  const { recipe_id, rating, comment } = parsed.data;
  const recipe = get<{ user_id: number; title: string }>("SELECT user_id, title FROM recipes WHERE id = ?", recipe_id);
  if (!recipe) return { message: "This recipe no longer exists." };
  if (recipe.user_id === user.id) return { message: "You can't review your own recipe." };

  const updated = run(
    "UPDATE reviews SET rating = ?, comment = ?, created_at = datetime('now') WHERE recipe_id = ? AND user_id = ?",
    [rating, comment, recipe_id, user.id],
  ).changes > 0;
  if (!updated) {
    run("INSERT INTO reviews (recipe_id, user_id, rating, comment) VALUES (?, ?, ?, ?)", [recipe_id, user.id, rating, comment]);
    notify({
      userId: recipe.user_id, actorId: user.id, recipeId: recipe_id, type: "review",
      message: `${user.name} rated ${recipe.title} ${"★".repeat(rating)}`,
    });
  }
  revalidatePath("/", "layout");
  return { ok: true, message: updated ? "Your review was updated." : "Thanks for your review!" };
}

export async function deleteReview(reviewId: number) {
  const user = await requireUser();
  const review = get<{ user_id: number }>("SELECT user_id FROM reviews WHERE id = ?", reviewId);
  if (!review || !canManage(user, review.user_id)) return;
  run("DELETE FROM reviews WHERE id = ?", reviewId);
  revalidatePath("/", "layout");
}
