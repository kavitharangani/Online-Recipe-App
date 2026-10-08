import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChefHat, Clock, Eye, Flame, Lightbulb, Pencil, Trash2, Users, UtensilsCrossed } from "lucide-react";
import { deleteRecipe, deleteReview } from "@/actions/recipes";
import { getCurrentUser } from "@/lib/dal";
import { run } from "@/lib/db";
import { formatDate, formatMinutes, splitTags, timeAgo, toISODate } from "@/lib/format";
import { getFavoriteIds, getRatingBreakdown, getRecipe, getRelatedRecipes, getReviews } from "@/lib/queries";
import { Avatar } from "@/components/Avatar";
import { FavoriteButton } from "@/components/FavoriteButton";
import { DifficultyBadge, RecipeGrid } from "@/components/RecipeCard";
import { RecipeImage } from "@/components/RecipeImage";
import { Stars } from "@/components/Stars";
import { Container, Flash } from "@/components/layout";
import { ConfirmButton } from "@/components/ui";
import { GrowBar, Reveal, ScrollProgress, Stagger, StaggerItem } from "@/components/motion";
import { AddToPlanButton } from "./AddToPlanButton";
import { IngredientsPanel } from "./IngredientsPanel";
import { PrintButton, ShareButton } from "./ShareButtons";
import { ReviewForm } from "./ReviewForm";
import { StepsList } from "./StepsList";

async function loadRecipe(params: Promise<{ id: string }>) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const recipe = getRecipe(id);
  if (!recipe) notFound();
  return recipe;
}

export async function generateMetadata({ params }: PageProps<"/recipes/[id]">): Promise<Metadata> {
  const recipe = await loadRecipe(params);
  return { title: recipe.title, description: recipe.description };
}

export default async function RecipePage({ params, searchParams }: PageProps<"/recipes/[id]">) {
  const recipe = await loadRecipe(params);
  const { saved } = await searchParams;
  const user = await getCurrentUser();

  run("UPDATE recipes SET views = views + 1 WHERE id = ?", recipe.id);

  const reviews = getReviews(recipe.id);
  const breakdown = getRatingBreakdown(recipe.id);
  const related = getRelatedRecipes(recipe);
  const favoriteIds = getFavoriteIds(user?.id);
  const canManage = !!user && (user.id === recipe.user_id || user.role === "admin");
  const myReview = user ? reviews.find((review) => review.user_id === user.id) : undefined;
  const totalTime = recipe.prep_time + recipe.cook_time;

  return (
    <Container className="!py-8">
      <ScrollProgress />
      {saved && <Flash>Recipe saved! Here&apos;s how it looks to everyone else.</Flash>}

      <nav className="no-print mb-6 text-sm text-stone-500">
        <Link href="/recipes" className="hover:text-brand-600">Recipes</Link>
        {recipe.category_name && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/recipes?category=${recipe.category_slug}`} className="hover:text-brand-600">
              {recipe.category_name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <Reveal kind="wipe" className="relative">
          <RecipeImage
            id={recipe.id}
            src={recipe.image}
            title={recipe.title}
            emoji={recipe.category_emoji}
            className="aspect-[4/3] w-full rounded-3xl shadow-lg"
            emojiClass="text-[8rem]"
          />
          {recipe.is_featured === 1 && (
            <span className="absolute top-4 left-4 rounded-full bg-brand-500 px-3 py-1 text-xs font-bold text-white shadow">
              ★ Editor&apos;s pick
            </span>
          )}
        </Reveal>

        <Reveal kind="fade-right" delay={0.2} className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            {recipe.category_name && <span className="chip">{recipe.category_emoji} {recipe.category_name}</span>}
            {recipe.cuisine && <span className="chip">🌍 {recipe.cuisine}</span>}
            <DifficultyBadge difficulty={recipe.difficulty} />
          </div>
          <h1 className="mt-4 font-display text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">{recipe.title}</h1>
          <a href="#reviews" className="mt-3 flex items-center gap-2 text-sm text-stone-500 hover:text-brand-600">
            <Stars rating={recipe.avg_rating} />
            {recipe.avg_rating !== null ? (
              <span><strong className="text-stone-800 dark:text-stone-200">{recipe.avg_rating.toFixed(1)}</strong> ({recipe.review_count} review{recipe.review_count === 1 ? "" : "s"})</span>
            ) : (
              <span>No reviews yet</span>
            )}
          </a>
          <p className="mt-4 text-lg text-stone-600 dark:text-stone-300">{recipe.description}</p>

          <Stagger as="div" inView={false} delay={0.5} className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: Clock, label: "Prep", value: formatMinutes(recipe.prep_time) },
              { icon: ChefHat, label: "Cook", value: formatMinutes(recipe.cook_time) },
              { icon: Users, label: "Serves", value: String(recipe.servings) },
              { icon: Flame, label: "Calories", value: recipe.calories !== null ? `${recipe.calories} kcal` : "—" },
            ].map(({ icon: Icon, label, value }) => (
              <StaggerItem key={label} kind="pop" className="card px-3 py-3 text-center">
                <Icon className="mx-auto size-5 text-brand-500" />
                <p className="mt-1 text-xs text-stone-500">{label}</p>
                <p className="font-semibold">{value}</p>
              </StaggerItem>
            ))}
          </Stagger>
          <p className="mt-3 text-sm text-stone-500">
            Total time <strong className="text-stone-700 dark:text-stone-300">{formatMinutes(totalTime)}</strong>
            <span className="mx-2">·</span>
            <Eye className="inline size-4" /> {recipe.views + 1} views
            <span className="mx-2">·</span>
            {recipe.favorite_count} saves
          </p>

          <div className="no-print mt-6 flex flex-wrap gap-2">
            <FavoriteButton recipeId={recipe.id} initial={favoriteIds.has(recipe.id)} signedIn={!!user} variant="button" />
            <Link href={`/recipes/${recipe.id}/cook`} className="btn-secondary">
              <UtensilsCrossed className="size-4" /> Cook mode
            </Link>
            <AddToPlanButton recipeId={recipe.id} signedIn={!!user} today={toISODate(new Date())} />
            <ShareButton title={recipe.title} />
            <PrintButton />
          </div>

          {canManage && (
            <div className="no-print mt-3 flex flex-wrap gap-2">
              <Link href={`/recipes/${recipe.id}/edit`} className="btn-ghost">
                <Pencil className="size-4" /> Edit
              </Link>
              <ConfirmButton
                action={deleteRecipe.bind(null, recipe.id)}
                confirmText={`Delete "${recipe.title}"? This can't be undone.`}
                className="btn-ghost !text-red-600"
              >
                <Trash2 className="size-4" /> Delete
              </ConfirmButton>
            </div>
          )}

          <Link href={`/profile/${recipe.user_id}`} className="card mt-auto flex items-center gap-3 p-4 transition hover:border-brand-300">
            <Avatar name={recipe.author_name} src={recipe.author_avatar} />
            <div className="min-w-0">
              <p className="text-xs text-stone-500">Recipe by</p>
              <p className="font-semibold">{recipe.author_name}</p>
            </div>
            <span className="ml-auto text-xs text-stone-400">
              {formatDate(recipe.created_at)}
              {recipe.updated_at !== recipe.created_at && <> · updated {timeAgo(recipe.updated_at)}</>}
            </span>
          </Link>
        </Reveal>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[380px_1fr]">
        <aside>
          <IngredientsPanel
            recipeId={recipe.id}
            baseServings={recipe.servings}
            ingredients={recipe.ingredients}
            signedIn={!!user}
          />
        </aside>
        <section>
          <h2 className="font-display text-2xl font-semibold">Method</h2>
          <StepsList steps={recipe.steps} />

          {recipe.tips && (
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/20 dark:bg-amber-500/10">
              <h3 className="flex items-center gap-2 font-semibold text-amber-900 dark:text-amber-200">
                <Lightbulb className="size-5" /> Cook&apos;s tips
              </h3>
              <p className="mt-2 text-sm whitespace-pre-line text-amber-900/90 dark:text-amber-100/90">{recipe.tips}</p>
            </div>
          )}

          {splitTags(recipe.tags).length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {splitTags(recipe.tags).map((tag) => (
                <Link key={tag} href={`/recipes?q=${encodeURIComponent(tag)}`} className="chip hover:!bg-brand-100 hover:!text-brand-800">
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <section id="reviews" className="no-print mt-16 scroll-mt-24">
        <h2 className="font-display text-2xl font-semibold">Ratings &amp; reviews</h2>
        <div className="mt-6 grid gap-8 lg:grid-cols-[320px_1fr]">
          <div className="card h-fit p-6">
            <p className="font-display text-5xl font-semibold">{recipe.avg_rating?.toFixed(1) ?? "–"}</p>
            <Stars rating={recipe.avg_rating} size="size-5" />
            <p className="mt-1 text-sm text-stone-500">{recipe.review_count} review{recipe.review_count === 1 ? "" : "s"}</p>
            <div className="mt-5 space-y-2">
              {breakdown.map(({ rating, count }) => (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span className="w-3 text-stone-500">{rating}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                    <GrowBar
                      className="h-full rounded-full bg-amber-400"
                      percent={recipe.review_count ? (count / recipe.review_count) * 100 : 0}
                      delay={(5 - rating) * 0.1}
                    />
                  </div>
                  <span className="w-6 text-right text-stone-500">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {!user ? (
              <div className="card p-6 text-sm">
                <Link href={`/login?next=/recipes/${recipe.id}`} className="font-semibold text-brand-600 hover:underline">Log in</Link>{" "}
                to rate and review this recipe.
              </div>
            ) : user.id === recipe.user_id ? null : (
              <ReviewForm recipeId={recipe.id} existing={myReview ? { rating: myReview.rating, comment: myReview.comment } : undefined} />
            )}

            {reviews.length === 0 ? (
              <p className="text-sm text-stone-500">No reviews yet — be the first to share how it turned out!</p>
            ) : (
              <Stagger as="ul" className="space-y-4">
                {reviews.map((review) => (
                  <StaggerItem as="li" kind="slide" key={review.id} className="card p-5">
                    <div className="flex items-center gap-3">
                      <Link href={`/profile/${review.user_id}`}>
                        <Avatar name={review.user_name} src={review.user_avatar} size="sm" />
                      </Link>
                      <div>
                        <Link href={`/profile/${review.user_id}`} className="text-sm font-semibold hover:text-brand-600">
                          {review.user_name}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-stone-500">
                          <Stars rating={review.rating} size="size-3.5" /> {timeAgo(review.created_at)}
                        </div>
                      </div>
                      {user && (user.id === review.user_id || user.role === "admin") && (
                        <ConfirmButton
                          action={deleteReview.bind(null, review.id)}
                          confirmText="Delete this review?"
                          className="btn-ghost ml-auto !p-2 text-stone-400 hover:!text-red-600"
                          title="Delete review"
                        >
                          <Trash2 className="size-4" />
                        </ConfirmButton>
                      )}
                    </div>
                    {review.comment && <p className="mt-3 text-sm text-stone-700 dark:text-stone-300">{review.comment}</p>}
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="no-print mt-16">
          <h2 className="mb-6 font-display text-2xl font-semibold">You might also like</h2>
          <RecipeGrid recipes={related} favoriteIds={favoriteIds} signedIn={!!user} animation="pop" />
        </section>
      )}
    </Container>
  );
}
