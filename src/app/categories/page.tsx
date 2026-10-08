import type { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "@/lib/queries";
import { Container, PageHeader } from "@/components/layout";
import { Stagger, StaggerItem } from "@/components/motion";

export const metadata: Metadata = { title: "Categories" };

export default function CategoriesPage() {
  const categories = getCategories();
  return (
    <Container>
      <PageHeader title="Categories" subtitle="Find exactly what you're in the mood for." />
      <Stagger interval={0.07} className="grid gap-4 [perspective:1000px] sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <StaggerItem key={category.id} kind="swing" hoverLift>
          <Link
            href={`/recipes?category=${category.slug}`}
            className="card group flex items-center gap-5 p-6 transition hover:border-brand-300 hover:shadow-lg"
          >
            <span className="grid size-16 place-items-center rounded-2xl bg-brand-50 text-4xl transition group-hover:animate-wiggle dark:bg-brand-500/10">
              {category.emoji}
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold group-hover:text-brand-600">{category.name}</h2>
              <p className="text-sm text-stone-500">{category.recipe_count} recipe{category.recipe_count === 1 ? "" : "s"}</p>
            </div>
          </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </Container>
  );
}
