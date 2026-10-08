import Link from "next/link";
import { Clock, Flame, Star } from "lucide-react";
import { formatMinutes } from "@/lib/format";
import type { RecipeSummary } from "@/lib/types";
import { Avatar } from "./Avatar";
import { FavoriteButton } from "./FavoriteButton";
import { RecipeImage } from "./RecipeImage";
import { Stagger, StaggerItem, type StaggerKind } from "./motion";

const DIFFICULTY_STYLE = {
  Easy: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  Medium: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  Hard: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
};

export function DifficultyBadge({ difficulty }: { difficulty: RecipeSummary["difficulty"] }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${DIFFICULTY_STYLE[difficulty]}`}>{difficulty}</span>;
}

export function RecipeCard({
  recipe,
  favorited,
  signedIn,
}: {
  recipe: RecipeSummary;
  favorited: boolean;
  signedIn: boolean;
}) {
  return (
    <article className="group card relative flex h-full flex-col overflow-hidden transition-shadow hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden">
        <RecipeImage
          id={recipe.id}
          src={recipe.image}
          title={recipe.title}
          emoji={recipe.category_emoji}
          className="size-full transition duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
        />
        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton recipeId={recipe.id} initial={favorited} signedIn={signedIn} />
        </div>
        {recipe.category_name && (
          <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-stone-800 backdrop-blur dark:bg-stone-900/90 dark:text-stone-100">
            {recipe.category_emoji} {recipe.category_name}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg leading-snug font-semibold group-hover:text-brand-600">
            {/* Stretched link: the whole card is clickable without nesting the favorite button inside <a>. */}
            <Link href={`/recipes/${recipe.id}`} className="after:absolute after:inset-0">
              {recipe.title}
            </Link>
          </h3>
          {recipe.avg_rating !== null && (
            <span className="flex shrink-0 items-center gap-1 text-sm font-semibold">
              <Star className="size-4 fill-amber-400 text-amber-400" /> {recipe.avg_rating.toFixed(1)}
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-stone-500 dark:text-stone-400">{recipe.description}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 pt-4 text-xs text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" /> {formatMinutes(recipe.prep_time + recipe.cook_time)}
          </span>
          {recipe.calories !== null && (
            <span className="flex items-center gap-1">
              <Flame className="size-3.5" /> {recipe.calories} kcal
            </span>
          )}
          <DifficultyBadge difficulty={recipe.difficulty} />
        </div>
        <div className="mt-3 flex items-center gap-2 border-t border-stone-100 pt-3 text-xs text-stone-500 dark:border-stone-800">
          <Avatar name={recipe.author_name} src={recipe.author_avatar} size="xs" />
          <span className="truncate">by {recipe.author_name}</span>
        </div>
      </div>
    </article>
  );
}

export function RecipeGrid({
  recipes,
  favoriteIds,
  signedIn,
  animation = "cascade",
}: {
  recipes: RecipeSummary[];
  favoriteIds: Set<number>;
  signedIn: boolean;
  /** How the cards enter as they scroll into view. */
  animation?: StaggerKind;
}) {
  return (
    // `key` replays the entrance when the result set changes (e.g. new filters).
    <Stagger key={recipes.map((r) => r.id).join(",")} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" interval={0.09}>
      {recipes.map((recipe) => (
        <StaggerItem key={recipe.id} kind={animation} hoverLift>
          <RecipeCard recipe={recipe} favorited={favoriteIds.has(recipe.id)} signedIn={signedIn} />
        </StaggerItem>
      ))}
    </Stagger>
  );
}
