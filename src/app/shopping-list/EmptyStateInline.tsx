import Link from "next/link";

export function EmptyStateInline() {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <span className="text-5xl">🧺</span>
      <h2 className="mt-4 font-display text-xl font-semibold">Your list is empty</h2>
      <p className="mt-2 max-w-sm text-sm text-stone-500">
        Add items above, or open any recipe and tap “Add to shopping list”. You can also send a whole week from the meal planner.
      </p>
      <div className="mt-6 flex gap-2">
        <Link href="/recipes" className="btn-primary">Browse recipes</Link>
        <Link href="/planner" className="btn-secondary">Meal planner</Link>
      </div>
    </div>
  );
}
