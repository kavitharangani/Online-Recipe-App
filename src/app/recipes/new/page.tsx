import type { Metadata } from "next";
import { requireUser } from "@/lib/dal";
import { getCategories } from "@/lib/queries";
import { RecipeForm } from "@/components/RecipeForm";
import { Container, PageHeader } from "@/components/layout";

export const metadata: Metadata = { title: "New recipe" };

export default async function NewRecipePage() {
  await requireUser();
  return (
    <Container className="max-w-4xl">
      <PageHeader title="Share a recipe" subtitle="Your kitchen secrets, beautifully presented." />
      <RecipeForm categories={getCategories()} />
    </Container>
  );
}
