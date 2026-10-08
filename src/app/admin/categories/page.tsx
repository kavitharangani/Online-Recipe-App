import type { Metadata } from "next";
import { requireAdmin } from "@/lib/dal";
import { getCategories } from "@/lib/queries";
import { CategoryManager } from "./CategoryManager";

export const metadata: Metadata = { title: "Categories · Admin" };

export default async function AdminCategoriesPage() {
  await requireAdmin();
  return <CategoryManager categories={getCategories()} />;
}
