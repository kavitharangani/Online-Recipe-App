import { requireAdmin } from "@/lib/dal";
import { Container } from "@/components/layout";
import { AdminTabs } from "./AdminTabs";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  // Each admin page and action also checks requireAdmin(); this just guards the shell.
  await requireAdmin();
  return (
    <Container>
      <div className="mb-8">
        <p className="text-sm font-semibold tracking-widest text-brand-600 uppercase">Admin panel</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Manage Flavorly</h1>
      </div>
      <AdminTabs />
      <div className="mt-8">{children}</div>
    </Container>
  );
}
