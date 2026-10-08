import type { Metadata } from "next";
import { requireUser } from "@/lib/dal";
import { getFavoriteRecipes } from "@/lib/queries";
import { RecipeGrid } from "@/components/RecipeCard";
import { Container, EmptyState, PageHeader } from "@/components/layout";

export const metadata: Metadata = { title: "Favorites" };

export default async function FavoritesPage() {
  const user = await requireUser();
  const recipes = getFavoriteRecipes(user.id);

  return (
    <Container>
      <PageHeader title="❤️ Favorites" subtitle={`${recipes.length} saved recipe${recipes.length === 1 ? "" : "s"}`} />
      {recipes.length ? (
        <RecipeGrid recipes={recipes} favoriteIds={new Set(recipes.map((r) => r.id))} signedIn />
      ) : (
        <EmptyState emoji="💛" title="No favorites yet" text="Tap the heart on any recipe to save it here for later." action={{ href: "/recipes", label: "Browse recipes" }} />
      )}
    </Container>
  );
}
