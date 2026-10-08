"use client";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <span className="text-7xl">🔥</span>
      <h1 className="mt-6 font-display text-4xl font-semibold">Something burned</h1>
      <p className="mt-3 text-stone-500">An unexpected error occurred. Please try again.</p>
      {error.digest && <p className="mt-2 font-mono text-xs text-stone-400">Ref: {error.digest}</p>}
      <button type="button" onClick={reset} className="btn-primary mt-8">Try again</button>
    </div>
  );
}
