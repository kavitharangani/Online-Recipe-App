import Link from "next/link";
import { ChefHat } from "lucide-react";

export function Footer() {
  return (
    <footer className="no-print mt-20 border-t border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold">
            <span className="grid size-8 place-items-center rounded-lg bg-brand-500 text-white">
              <ChefHat className="size-4" />
            </span>
            Flavorly
          </Link>
          <p className="mt-3 max-w-sm text-sm text-stone-500 dark:text-stone-400">
            Your kitchen companion — discover recipes, share your own, plan the week and never forget an ingredient again.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm text-stone-500 dark:text-stone-400">
            <li><Link href="/recipes" className="hover:text-brand-600">All recipes</Link></li>
            <li><Link href="/categories" className="hover:text-brand-600">Categories</Link></li>
            <li><Link href="/recipes?sort=rating" className="hover:text-brand-600">Top rated</Link></li>
            <li><Link href="/recipes?maxTime=30" className="hover:text-brand-600">Under 30 minutes</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Your kitchen</h3>
          <ul className="mt-3 space-y-2 text-sm text-stone-500 dark:text-stone-400">
            <li><Link href="/recipes/new" className="hover:text-brand-600">Share a recipe</Link></li>
            <li><Link href="/planner" className="hover:text-brand-600">Meal planner</Link></li>
            <li><Link href="/shopping-list" className="hover:text-brand-600">Shopping list</Link></li>
            <li><Link href="/favorites" className="hover:text-brand-600">Favorites</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-100 py-5 text-center text-xs text-stone-400 dark:border-stone-900">
        © {new Date().getFullYear()} Flavorly. Made with love and a pinch of salt.
      </div>
    </footer>
  );
}
