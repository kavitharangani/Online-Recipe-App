import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/dal";
import { getCategories, getCuisines, getFavoriteIds, searchRecipes, SORTS, type SortKey } from "@/lib/queries";
import { RecipeGrid } from "@/components/RecipeCard";
import { Container, EmptyState, PageHeader } from "@/components/layout";
import { RecipeFilters } from "./RecipeFilters";

export const metadata: Metadata = { title: "Recipes" };

function param(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

export default async function RecipesPage({ searchParams }: PageProps<"/recipes">) {
  const params = await searchParams;
  const filters = {
    q: param(params.q),
    category: param(params.category),
    difficulty: param(params.difficulty),
    cuisine: param(params.cuisine),
    maxTime: Number(param(params.maxTime)) || undefined,
    sort: (param(params.sort) in SORTS ? param(params.sort) : "newest") as SortKey,
    page: Number(param(params.page)) || 1,
  };

  const user = await getCurrentUser();
  const { recipes, total, page, pageCount } = searchRecipes(filters);
  const categories = getCategories();
  const category = categories.find((c) => c.slug === filters.category);

  const pageHref = (target: number) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value && key !== "page") query.set(key, String(value));
    }
    if (target > 1) query.set("page", String(target));
    return `/recipes?${query}`;
  };

  return (
    <Container>
      <PageHeader
        title={category ? `${category.emoji} ${category.name}` : filters.q ? `Results for “${filters.q}”` : "All recipes"}
        subtitle={`${total} recipe${total === 1 ? "" : "s"} to explore`}
        actions={
          <Link href="/recipes/new" className="btn-primary">
            <Plus className="size-4" /> Share a recipe
          </Link>
        }
      />
      <RecipeFilters
        values={{ ...filters, maxTime: filters.maxTime ? String(filters.maxTime) : "" }}
        categories={categories.map(({ slug, name, emoji }) => ({ slug, name, emoji }))}
        cuisines={getCuisines()}
      />

      <div className="mt-8">
        {recipes.length ? (
          <RecipeGrid recipes={recipes} favoriteIds={getFavoriteIds(user?.id)} signedIn={!!user} />
        ) : (
          <EmptyState
            emoji="🔍"
            title="No recipes match"
            text="Try a different search term or clear some filters."
            action={{ href: "/recipes", label: "Clear filters" }}
          />
        )}
      </div>

      {pageCount > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
          {page > 1 && (
            <Link href={pageHref(page - 1)} className="btn-secondary">
              <ChevronLeft className="size-4" /> Previous
            </Link>
          )}
          <span className="px-3 text-sm text-stone-500">
            Page {page} of {pageCount}
          </span>
          {page < pageCount && (
            <Link href={pageHref(page + 1)} className="btn-secondary">
              Next <ChevronRight className="size-4" />
            </Link>
          )}
        </nav>
      )}
    </Container>
  );
}
