import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Heart, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { deleteRecipe } from "@/actions/recipes";
import { requireUser } from "@/lib/dal";
import { formatDate, formatMinutes } from "@/lib/format";
import { getUserRecipes } from "@/lib/queries";
import { RecipeImage } from "@/components/RecipeImage";
import { Container, EmptyState, Flash, PageHeader } from "@/components/layout";
import { ConfirmButton } from "@/components/ui";
import { Stagger, StaggerItem } from "@/components/motion";

export const metadata: Metadata = { title: "My recipes" };

export default async function MyRecipesPage({ searchParams }: PageProps<"/my-recipes">) {
  const user = await requireUser();
  const { deleted } = await searchParams;
  const recipes = getUserRecipes(user.id);

  return (
    <Container>
      {deleted && <Flash>Recipe deleted.</Flash>}
      <PageHeader
        title="My recipes"
        subtitle={`${recipes.length} recipe${recipes.length === 1 ? "" : "s"} shared`}
        actions={<Link href="/recipes/new" className="btn-primary"><Plus className="size-4" /> New recipe</Link>}
      />
      {recipes.length === 0 ? (
        <EmptyState emoji="🧑‍🍳" title="Your cookbook is empty" text="Share a family favourite and it'll show up here." action={{ href: "/recipes/new", label: "Create your first recipe" }} />
      ) : (
        <Stagger as="ul" interval={0.06} className="space-y-3">
          {recipes.map((recipe) => (
            <StaggerItem as="li" kind="slide" key={recipe.id} className="card flex flex-wrap items-center gap-4 p-3 transition-shadow hover:shadow-md sm:flex-nowrap">
              <Link href={`/recipes/${recipe.id}`} className="shrink-0">
                <RecipeImage id={recipe.id} src={recipe.image} title={recipe.title} emoji={recipe.category_emoji} className="size-20 rounded-xl" emojiClass="text-3xl" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/recipes/${recipe.id}`} className="font-semibold hover:text-brand-600">{recipe.title}</Link>
                <p className="text-xs text-stone-500">
                  {recipe.category_emoji} {recipe.category_name} · {formatMinutes(recipe.prep_time + recipe.cook_time)} · {formatDate(recipe.created_at)}
                </p>
                <div className="mt-2 flex gap-4 text-xs text-stone-500">
                  <span className="flex items-center gap-1"><Eye className="size-3.5" /> {recipe.views}</span>
                  <span className="flex items-center gap-1"><Heart className="size-3.5" /> {recipe.favorite_count}</span>
                  <span className="flex items-center gap-1"><Star className="size-3.5" /> {recipe.avg_rating ?? "–"} ({recipe.review_count})</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/recipes/${recipe.id}/edit`} className="btn-secondary"><Pencil className="size-4" /> Edit</Link>
                <ConfirmButton
                  action={deleteRecipe.bind(null, recipe.id)}
                  confirmText={`Delete "${recipe.title}"? This can't be undone.`}
                  className="btn-secondary !text-red-600"
                  title="Delete recipe"
                >
                  <Trash2 className="size-4" />
                </ConfirmButton>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </Container>
  );
}
