import type { Metadata } from "next";
import { requireUser } from "@/lib/dal";
import { getShoppingItems } from "@/lib/queries";
import { Container, PageHeader } from "@/components/layout";
import { ShoppingList } from "./ShoppingList";

export const metadata: Metadata = { title: "Shopping list" };

export default async function ShoppingListPage() {
  const user = await requireUser();
  const items = getShoppingItems(user.id);
  const remaining = items.filter((item) => !item.checked).length;

  return (
    <Container className="max-w-3xl">
      <PageHeader
        title="🛒 Shopping list"
        subtitle={items.length ? `${remaining} of ${items.length} item${items.length === 1 ? "" : "s"} left to buy` : "Add items yourself or from any recipe."}
      />
      <ShoppingList items={items} />
    </Container>
  );
}
