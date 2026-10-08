import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, CalendarDays, Eye, Heart, MessageSquare, Plus, ShoppingCart } from "lucide-react";
import { requireUser } from "@/lib/dal";
import { toISODate } from "@/lib/format";
import { getDashboardStats, getFavoriteIds, getFollowingFeed, getLatestRecipes, getMealPlan, getUserRecipes } from "@/lib/queries";
import { RecipeGrid } from "@/components/RecipeCard";
import { RecipeImage } from "@/components/RecipeImage";
import { Container, EmptyState } from "@/components/layout";
import { CountUp, Reveal, Stagger, StaggerItem, TextReveal } from "@/components/motion";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const stats = getDashboardStats(user.id);
  const today = toISODate(new Date());
  const todaysMeals = getMealPlan(user.id, today, today);
  const myRecipes = getUserRecipes(user.id).slice(0, 4);
  const feed = getFollowingFeed(user.id, 4);
  const suggestions = feed.length ? feed : getLatestRecipes(4).filter((r) => r.user_id !== user.id);
  const favoriteIds = getFavoriteIds(user.id);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const cards = [
    { label: "My recipes", value: stats.recipes, icon: BookOpen, href: "/my-recipes" },
    { label: "Recipe views", value: stats.views, icon: Eye, href: "/my-recipes" },
    { label: "Times saved", value: stats.favorites, icon: Heart, href: "/my-recipes" },
    { label: "Reviews received", value: stats.reviews, icon: MessageSquare, href: "/my-recipes" },
    { label: "Upcoming meals", value: stats.planned, icon: CalendarDays, href: "/planner" },
    { label: "To buy", value: stats.shopping, icon: ShoppingCart, href: "/shopping-list" },
  ];

  return (
    <Container>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-stone-500">{greeting},</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            <TextReveal text={`${user.name.split(" ")[0]} 👩‍🍳`} />
          </h1>
        </div>
        <Link href="/recipes/new" className="btn-primary">
          <Plus className="size-4" /> New recipe
        </Link>
      </div>

      <Stagger inView={false} interval={0.07} className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {cards.map(({ label, value, icon: Icon, href }) => (
          <StaggerItem key={label} kind="pop" hoverLift>
            <Link href={href} className="group card block h-full p-5 transition hover:border-brand-300 hover:shadow-md">
              <Icon className="size-5 text-brand-500 transition group-hover:scale-125 group-hover:-rotate-12" />
              <p className="mt-3 font-display text-3xl font-semibold"><CountUp value={value} /></p>
              <p className="text-sm text-stone-500">{label}</p>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold">My latest recipes</h2>
            <Link href="/my-recipes" className="text-sm font-semibold text-brand-600">View all</Link>
          </div>
          {myRecipes.length ? (
            <Stagger className="grid gap-6 sm:grid-cols-2">
              {myRecipes.map((recipe) => (
                <StaggerItem key={recipe.id} kind="slide">
                <Link href={`/recipes/${recipe.id}`} className="card flex items-center gap-4 p-3 transition hover:translate-x-1 hover:shadow-md">
                  <RecipeImage id={recipe.id} src={recipe.image} title={recipe.title} emoji={recipe.category_emoji} className="size-20 shrink-0 rounded-xl" emojiClass="text-3xl" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{recipe.title}</p>
                    <p className="text-xs text-stone-500">
                      {recipe.views} views · {recipe.favorite_count} saves · {recipe.avg_rating ? `★ ${recipe.avg_rating}` : "no ratings"}
                    </p>
                  </div>
                </Link>
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <EmptyState emoji="📝" title="No recipes yet" text="Share your first recipe with the community." action={{ href: "/recipes/new", label: "Create a recipe" }} />
          )}
        </section>

        <Reveal kind="fade-right" delay={0.3} className="card h-fit p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Today&apos;s menu</h2>
            <Link href="/planner" className="text-sm font-semibold text-brand-600">Planner</Link>
          </div>
          {todaysMeals.length ? (
            <ul className="mt-4 space-y-3">
              {todaysMeals.map((meal) => (
                <li key={meal.id}>
                  <Link href={`/recipes/${meal.recipe_id}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-stone-50 dark:hover:bg-stone-800">
                    <RecipeImage id={meal.recipe_id} src={meal.image} title={meal.title} emoji={meal.category_emoji} className="size-12 shrink-0 rounded-lg" emojiClass="text-xl" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold tracking-wide text-brand-600 uppercase">{meal.meal_type}</p>
                      <p className="truncate text-sm font-medium">{meal.title}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-stone-500">
              Nothing planned for today.{" "}
              <Link href="/planner" className="font-semibold text-brand-600 hover:underline">Plan your meals →</Link>
            </p>
          )}
        </Reveal>
      </div>

      {suggestions.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 font-display text-2xl font-semibold">{feed.length ? "From cooks you follow" : "Fresh ideas for you"}</h2>
          <RecipeGrid recipes={suggestions} favoriteIds={favoriteIds} signedIn animation="pop" />
        </section>
      )}
    </Container>
  );
}
