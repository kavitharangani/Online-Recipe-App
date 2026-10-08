import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { requireUser } from "@/lib/dal";
import { toISODate } from "@/lib/format";
import { getFavoriteIds, getMealPlan, getRecipeOptions } from "@/lib/queries";
import { Container, PageHeader } from "@/components/layout";
import { PlannerBoard } from "./PlannerBoard";

export const metadata: Metadata = { title: "Meal planner" };

function mondayOf(date: Date) {
  const monday = new Date(date);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export default async function PlannerPage({ searchParams }: PageProps<"/planner">) {
  const user = await requireUser();
  const { week } = await searchParams;
  const requested = typeof week === "string" && /^\d{4}-\d{2}-\d{2}$/.test(week) ? new Date(`${week}T00:00`) : new Date();
  const start = mondayOf(Number.isNaN(requested.getTime()) ? new Date() : requested);
  const days = Array.from({ length: 7 }, (_, i) => toISODate(addDays(start, i)));
  const from = days[0];
  const to = days[6];

  const entries = getMealPlan(user.id, from, to);
  const favoriteIds = getFavoriteIds(user.id);
  // Favourites first in the picker, then everything else alphabetically.
  const options = getRecipeOptions().sort((a, b) => Number(favoriteIds.has(b.id)) - Number(favoriteIds.has(a.id)));

  const label = `${new Date(`${from}T00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${new Date(`${to}T00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <Container className="max-w-[90rem]">
      <PageHeader
        title="🗓️ Meal planner"
        subtitle="Plan breakfast, lunch, dinner and snacks for the week."
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/planner?week=${toISODate(addDays(start, -7))}`} className="btn-secondary !px-3" aria-label="Previous week">
              <ChevronLeft className="size-4" />
            </Link>
            <span className="min-w-44 text-center text-sm font-semibold">{label}</span>
            <Link href={`/planner?week=${toISODate(addDays(start, 7))}`} className="btn-secondary !px-3" aria-label="Next week">
              <ChevronRight className="size-4" />
            </Link>
            <Link href="/planner" className="btn-ghost">This week</Link>
          </div>
        }
      />
      <PlannerBoard
        days={days}
        today={toISODate(new Date())}
        entries={entries}
        options={options.map((o) => ({ ...o, favorite: favoriteIds.has(o.id) }))}
      />
    </Container>
  );
}
