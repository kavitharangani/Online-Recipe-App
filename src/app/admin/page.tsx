import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Eye, MessageSquare, Tags, UserPlus, Users } from "lucide-react";
import { requireAdmin } from "@/lib/dal";
import { all } from "@/lib/db";
import { timeAgo } from "@/lib/format";
import { getAdminStats, getAllUsers, getCategories, getLatestRecipes } from "@/lib/queries";
import { Avatar } from "@/components/Avatar";
import { CountUp, GrowBar, Reveal, Stagger, StaggerItem } from "@/components/motion";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminOverview() {
  await requireAdmin();
  const stats = getAdminStats();
  const newestUsers = getAllUsers().slice(0, 5);
  const newestRecipes = getLatestRecipes(5);
  const categories = getCategories().sort((a, b) => (b.recipe_count ?? 0) - (a.recipe_count ?? 0));
  const maxCount = Math.max(1, ...categories.map((c) => c.recipe_count ?? 0));
  const recentReviews = all<{ id: number; rating: number; comment: string; created_at: string; user_name: string; recipe_id: number; title: string }>(
    `SELECT rv.id, rv.rating, rv.comment, rv.created_at, u.name AS user_name, r.id AS recipe_id, r.title
     FROM reviews rv JOIN users u ON u.id = rv.user_id JOIN recipes r ON r.id = rv.recipe_id
     ORDER BY rv.created_at DESC LIMIT 5`,
  );

  const cards = [
    { label: "Users", value: stats.users, icon: Users },
    { label: "New this week", value: stats.new_users, icon: UserPlus },
    { label: "Recipes", value: stats.recipes, icon: BookOpen },
    { label: "Reviews", value: stats.reviews, icon: MessageSquare },
    { label: "Categories", value: stats.categories, icon: Tags },
    { label: "Total views", value: stats.views, icon: Eye },
  ];

  return (
    <div className="space-y-8">
      <Stagger inView={false} className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {cards.map(({ label, value, icon: Icon }) => (
          <StaggerItem key={label} kind="cascade" className="card p-5">
            <Icon className="size-5 text-brand-500" />
            <p className="mt-3 font-display text-3xl font-semibold"><CountUp value={value} /></p>
            <p className="text-sm text-stone-500">{label}</p>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="grid gap-6 lg:grid-cols-3">
        <Reveal kind="fade-up" className="card p-6">
          <h2 className="font-semibold">Recipes by category</h2>
          <ul className="mt-4 space-y-3">
            {categories.map((c) => (
              <li key={c.id} className="text-sm">
                <div className="mb-1 flex justify-between">
                  <span>{c.emoji} {c.name}</span>
                  <span className="text-stone-500">{c.recipe_count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                  <GrowBar className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600" percent={((c.recipe_count ?? 0) / maxCount) * 100} />
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal kind="fade-up" delay={0.1} className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Newest members</h2>
            <Link href="/admin/users" className="text-sm font-semibold text-brand-600">All users</Link>
          </div>
          <ul className="mt-4 space-y-3">
            {newestUsers.map((u) => (
              <li key={u.id}>
                <Link href={`/profile/${u.id}`} className="flex items-center gap-3 text-sm hover:text-brand-600">
                  <Avatar name={u.name} src={u.avatar} size="sm" />
                  <span className="flex-1 truncate font-medium">{u.name}</span>
                  <span className="text-xs text-stone-400">{timeAgo(u.created_at)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <h2 className="mt-8 font-semibold">Latest recipes</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {newestRecipes.map((r) => (
              <li key={r.id} className="flex justify-between gap-2">
                <Link href={`/recipes/${r.id}`} className="truncate hover:text-brand-600">{r.category_emoji} {r.title}</Link>
                <span className="shrink-0 text-xs text-stone-400">{timeAgo(r.created_at)}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal kind="fade-up" delay={0.2} className="card p-6">
          <h2 className="font-semibold">Recent reviews</h2>
          <ul className="mt-4 space-y-4">
            {recentReviews.map((rv) => (
              <li key={rv.id} className="text-sm">
                <p>
                  <span className="text-amber-500">{"★".repeat(rv.rating)}</span>{" "}
                  <strong>{rv.user_name}</strong> on{" "}
                  <Link href={`/recipes/${rv.recipe_id}#reviews`} className="text-brand-600 hover:underline">{rv.title}</Link>
                </p>
                {rv.comment && <p className="mt-1 line-clamp-2 text-stone-500">{rv.comment}</p>}
              </li>
            ))}
            {recentReviews.length === 0 && <li className="text-sm text-stone-500">No reviews yet.</li>}
          </ul>
        </Reveal>
      </div>
    </div>
  );
}
