import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <span className="text-7xl">🍳</span>
      <h1 className="mt-6 font-display text-4xl font-semibold">Recipe not found</h1>
      <p className="mt-3 text-stone-500">This page seems to have been eaten. Let&apos;s find you something else delicious.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn-primary">Go home</Link>
        <Link href="/recipes" className="btn-secondary">Browse recipes</Link>
      </div>
    </div>
  );
}
