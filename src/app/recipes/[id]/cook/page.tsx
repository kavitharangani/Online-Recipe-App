import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRecipe } from "@/lib/queries";
import { CookMode } from "./CookMode";

export async function generateMetadata({ params }: PageProps<"/recipes/[id]/cook">): Promise<Metadata> {
  const recipe = getRecipe(Number((await params).id));
  return { title: recipe ? `Cooking: ${recipe.title}` : "Cook mode" };
}

export default async function CookPage({ params }: PageProps<"/recipes/[id]/cook">) {
  const recipe = getRecipe(Number((await params).id));
  if (!recipe) notFound();
  return <CookMode recipe={recipe} />;
}
