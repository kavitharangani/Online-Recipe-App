import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getCategories, getRecipe } from "@/lib/queries";
import { RecipeForm } from "@/components/RecipeForm";
import { Container, PageHeader } from "@/components/layout";

export const metadata: Metadata = { title: "Edit recipe" };

export default async function EditRecipePage({ params }: PageProps<"/recipes/[id]/edit">) {
  const user = await requireUser();
  const recipe = getRecipe(Number((await params).id));
  if (!recipe) notFound();
  if (recipe.user_id !== user.id && user.role !== "admin") redirect(`/recipes/${recipe.id}`);

  return (
    <Container className="max-w-4xl">
      <PageHeader title="Edit recipe" subtitle={recipe.title} />
      <RecipeForm recipe={recipe} categories={getCategories()} />
    </Container>
  );
}
