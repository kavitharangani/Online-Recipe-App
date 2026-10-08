import Link from "next/link";
import { ArrowRight, CalendarDays, ChefHat, Plus, Search, ShoppingCart, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/dal";
import { getAdminStats, getCategories, getFavoriteIds, getFeaturedRecipes, getLatestRecipes, getTopRatedRecipes } from "@/lib/queries";
import { RecipeGrid } from "@/components/RecipeCard";
import { RecipeImage } from "@/components/RecipeImage";
import { Flash } from "@/components/layout";
import { CountUp, FloatingEmojis, Magnetic, Reveal, Stagger, StaggerItem, TextReveal, TiltCard } from "@/components/motion";

export default async function Home({ searchParams }: PageProps<"/">) {
  const { goodbye } = await searchParams;
  const user = await getCurrentUser();
  const favoriteIds = getFavoriteIds(user?.id);
  const featured = getFeaturedRecipes(4);
  const topRated = getTopRatedRecipes(4);
  const latest = getLatestRecipes(8);
  const categories = getCategories();
  const hero = featured[0] ?? latest[0];
  const stats = getAdminStats();

  return (
    <>
      <section className="relative overflow-hidden border-b border-stone-200 bg-gradient-to-b from-brand-50 to-stone-50 dark:border-stone-800 dark:from-brand-500/10 dark:to-stone-950">
        <FloatingEmojis />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            {goodbye && <Flash tone="info">Your account has been deleted. We&apos;ll miss your cooking!</Flash>}
            <Reveal kind="blur">
              <span className="chip !bg-brand-100 !text-brand-800 dark:!bg-brand-500/15 dark:!text-brand-300">
                <Sparkles className="size-3.5" /> Your all-in-one kitchen companion
              </span>
            </Reveal>
            <h1 className="mt-5 font-display text-4xl leading-tight font-semibold tracking-tight sm:text-6xl">
              <TextReveal text="Cook something" delay={0.1} />
              <TextReveal text="wonderful" delay={0.35} className="text-brand-500 italic" />
              <TextReveal text="today." delay={0.5} />
            </h1>
            <Reveal kind="blur" delay={0.6}>
              <p className="mt-5 max-w-lg text-lg text-stone-600 dark:text-stone-300">
                Discover home-cooked recipes, share your family favourites, plan the week&apos;s meals and turn them into a
                shopping list in one tap.
              </p>
            </Reveal>
            <Reveal kind="zoom" delay={0.75}>
              <form action="/recipes" className="mt-8 flex max-w-lg gap-2 rounded-2xl border border-stone-200 bg-white p-2 shadow-lg shadow-stone-200/50 transition focus-within:shadow-xl focus-within:shadow-brand-200/50 dark:border-stone-700 dark:bg-stone-900 dark:shadow-none">
                <label className="flex flex-1 items-center gap-2 px-2">
                  <Search className="size-5 text-stone-400" />
                  <span className="sr-only">Search recipes</span>
                  <input
                    name="q"
                    placeholder="Search by dish, ingredient or cuisine…"
                    className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-stone-400"
                  />
                </label>
                <button className="btn-primary">Search</button>
              </form>
              <div className="mt-4 flex flex-wrap gap-2 text-sm text-stone-500">
                Try:
                {["chicken", "coconut", "pasta", "chocolate"].map((term) => (
                  <Link key={term} href={`/recipes?q=${term}`} className="font-medium text-brand-600 hover:underline">
                    {term}
                  </Link>
                ))}
              </div>
            </Reveal>
            <Reveal kind="fade-up" delay={0.9}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Magnetic>
                  <Link href="/recipes/new" className="btn-primary !px-5 !py-3">
                    <Plus className="size-4" /> Share your recipe
                  </Link>
                </Magnetic>
                <Magnetic strength={0.25}>
                  <Link href="/recipes" className="btn-secondary !px-5 !py-3">Browse all recipes</Link>
                </Magnetic>
              </div>
              <dl className="mt-10 flex gap-8">
                {[
                  { label: "Recipes", value: stats.recipes },
                  { label: "Home cooks", value: stats.users },
                  { label: "Reviews", value: stats.reviews },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col-reverse">
                    <dt className="text-xs tracking-wide text-stone-500 uppercase">{stat.label}</dt>
                    <dd className="font-display text-3xl font-semibold text-brand-600">
                      <CountUp value={stat.value} />+
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          {hero && (
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-4 -rotate-3 rounded-[2rem] bg-brand-200/60 dark:bg-brand-500/20" />
              <TiltCard className="card relative overflow-hidden !rounded-[1.75rem] shadow-2xl">
                <Link href={`/recipes/${hero.id}`} className="group block">
                  <RecipeImage
                    id={hero.id}
                    src={hero.image}
                    title={hero.title}
                    emoji={hero.category_emoji}
                    className="aspect-square w-full"
                    emojiClass="text-[9rem]"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-6 pt-20 text-white">
                    <p className="text-xs font-semibold tracking-widest text-brand-200 uppercase">Featured recipe</p>
                    <p className="mt-1 font-display text-2xl font-semibold group-hover:underline">{hero.title}</p>
                    <p className="mt-1 text-sm text-white/80">by {hero.author_name}</p>
                  </div>
                </Link>
              </TiltCard>
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-20 px-4 py-16 sm:px-6">
        <section>
          <SectionTitle title="Browse by category" href="/categories" />
          <Stagger className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9" interval={0.06}>
            {categories.map((category) => (
              <StaggerItem key={category.id} kind="pop">
                <Link
                  href={`/recipes?category=${category.slug}`}
                  className="group card flex h-full flex-col items-center gap-2 px-2 py-5 text-center transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-md"
                >
                  <span className="text-3xl group-hover:animate-wiggle">{category.emoji}</span>
                  <span className="text-xs font-semibold">{category.name}</span>
                  <span className="text-[11px] text-stone-400">{category.recipe_count} recipe{category.recipe_count === 1 ? "" : "s"}</span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {featured.length > 0 && (
          <section>
            <SectionTitle title="Editor's picks" href="/recipes?sort=popular" />
            <RecipeGrid recipes={featured} favoriteIds={favoriteIds} signedIn={!!user} animation="cascade" />
          </section>
        )}

        <Reveal kind="zoom">
          <section className="relative grid gap-8 overflow-hidden rounded-3xl bg-stone-900 p-8 text-white sm:p-12 lg:grid-cols-3">
            <div className="absolute -top-24 -right-24 size-72 rounded-full bg-brand-500/30 blur-3xl" aria-hidden />
            {FEATURES.map(({ icon: Icon, title, text, kind }, index) => (
              <Reveal key={title} kind={kind} delay={0.15 + index * 0.15} className="group relative">
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-500 transition duration-500 group-hover:scale-110 group-hover:rotate-[360deg]">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-stone-300">{text}</p>
              </Reveal>
            ))}
            {!user && (
              <div className="relative lg:col-span-3">
                <Magnetic>
                  <Link href="/register" className="btn-primary">
                    Create your free account <ArrowRight className="size-4" />
                  </Link>
                </Magnetic>
              </div>
            )}
          </section>
        </Reveal>

        <section>
          <SectionTitle title="Top rated" href="/recipes?sort=rating" />
          <RecipeGrid recipes={topRated} favoriteIds={favoriteIds} signedIn={!!user} animation="pop" />
        </section>

        <section>
          <SectionTitle title="Fresh from the kitchen" href="/recipes" />
          <RecipeGrid recipes={latest} favoriteIds={favoriteIds} signedIn={!!user} animation="slide" />
        </section>
      </div>
    </>
  );
}

const FEATURES = [
  { icon: ChefHat, title: "Share your recipes", text: "Add photos, ingredients, step timers and tips. Let the community rate and save them.", kind: "fade-left" },
  { icon: CalendarDays, title: "Plan the week", text: "Drop recipes onto a weekly planner for breakfast, lunch, dinner and snacks.", kind: "flip" },
  { icon: ShoppingCart, title: "Shop smarter", text: "Turn any recipe — or your whole week — into a tidy, tickable shopping list.", kind: "fade-right" },
] as const;

function SectionTitle({ title, href }: { title: string; href: string }) {
  return (
    <Reveal kind="fade-left" className="mb-6 flex items-end justify-between gap-4">
      <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      <Link href={href} className="group flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
        See all <ArrowRight className="size-4 transition group-hover:translate-x-1" />
      </Link>
    </Reveal>
  );
}
