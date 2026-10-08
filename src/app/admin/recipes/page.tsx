import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Star, Trash2 } from "lucide-react";
import { adminDeleteRecipe, toggleFeatured } from "@/actions/admin";
import { requireAdmin } from "@/lib/dal";
import { formatDate } from "@/lib/format";
import { getAllRecipes } from "@/lib/queries";
import { RecipeImage } from "@/components/RecipeImage";
import { ConfirmButton, SubmitButton } from "@/components/ui";

export const metadata: Metadata = { title: "Recipes · Admin" };

export default async function AdminRecipesPage() {
  await requireAdmin();
  const recipes = getAllRecipes();

  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="border-b border-stone-100 bg-stone-50 text-xs tracking-wide text-stone-500 uppercase dark:border-stone-800 dark:bg-stone-800/50">
          <tr>
            <th className="px-4 py-3 font-semibold">Recipe</th>
            <th className="px-4 py-3 font-semibold">Author</th>
            <th className="px-4 py-3 font-semibold">Stats</th>
            <th className="px-4 py-3 font-semibold">Created</th>
            <th className="px-4 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
          {recipes.map((recipe) => (
            <tr key={recipe.id}>
              <td className="px-4 py-3">
                <Link href={`/recipes/${recipe.id}`} className="flex items-center gap-3">
                  <RecipeImage id={recipe.id} src={recipe.image} title={recipe.title} emoji={recipe.category_emoji} className="size-11 shrink-0 rounded-lg" emojiClass="text-xl" />
                  <span>
                    <span className="block font-medium hover:text-brand-600">{recipe.title}</span>
                    <span className="block text-xs text-stone-500">{recipe.category_name ?? "Uncategorised"}</span>
                  </span>
                </Link>
              </td>
              <td className="px-4 py-3">
                <Link href={`/profile/${recipe.user_id}`} className="hover:text-brand-600">{recipe.author_name}</Link>
              </td>
              <td className="px-4 py-3 text-xs text-stone-500">
                {recipe.views} views · {recipe.favorite_count} saves · ★ {recipe.avg_rating ?? "–"}
              </td>
              <td className="px-4 py-3 text-stone-500">{formatDate(recipe.created_at)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <form action={toggleFeatured.bind(null, recipe.id)}>
                    <SubmitButton className={`btn-ghost !px-2.5 !py-1.5 text-xs ${recipe.is_featured ? "!text-amber-600" : ""}`}>
                      <Star className={`size-4 ${recipe.is_featured ? "fill-current" : ""}`} />
                      {recipe.is_featured ? "Featured" : "Feature"}
                    </SubmitButton>
                  </form>
                  <Link href={`/recipes/${recipe.id}/edit`} className="btn-ghost !px-2.5 !py-1.5" aria-label={`Edit ${recipe.title}`}>
                    <Pencil className="size-4" />
                  </Link>
                  <ConfirmButton
                    action={adminDeleteRecipe.bind(null, recipe.id)}
                    confirmText={`Delete "${recipe.title}"?`}
                    className="btn-ghost !px-2.5 !py-1.5 !text-red-600"
                    title={`Delete ${recipe.title}`}
                  >
                    <Trash2 className="size-4" />
                  </ConfirmButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
