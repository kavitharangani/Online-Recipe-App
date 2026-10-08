"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { ArrowLeft, ArrowRight, List, PartyPopper, X } from "lucide-react";
import { formatQuantity } from "@/lib/format";
import type { RecipeDetail } from "@/lib/types";
import { StepTimer } from "@/components/StepTimer";

// Steps slide in from the side you're heading toward and out the other way.
const SLIDE: Variants = {
  enter: (direction: number) => ({ x: direction > 0 ? 220 : -220, opacity: 0, rotate: direction > 0 ? 4 : -4 }),
  center: { x: 0, opacity: 1, rotate: 0, transition: { type: "spring", stiffness: 260, damping: 28 } },
  exit: (direction: number) => ({ x: direction > 0 ? -220 : 220, opacity: 0, rotate: direction > 0 ? -4 : 4, transition: { duration: 0.2 } }),
};

const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  // Deterministic pseudo-random spread so server and client renders match.
  x: ((((Math.sin(i * 12.9898) * 43758.5453) % 1) + 1) % 1) * 600 - 300,
  delay: (i % 7) * 0.05,
  color: ["bg-brand-400", "bg-amber-300", "bg-emerald-400", "bg-rose-400", "bg-sky-400"][i % 5],
  rotate: (i * 47) % 360,
}));

/** Distraction-free, step-by-step view that keeps the screen awake while you cook. */
export function CookMode({ recipe }: { recipe: RecipeDetail }) {
  // Index -1 is the ingredient checklist; steps follow; steps.length is the "done" screen.
  const [[index, direction], setPage] = useState<[number, number]>([-1, 0]);
  const last = recipe.steps.length;

  const go = useCallback(
    (delta: number) => setPage(([i]) => [Math.min(last, Math.max(-1, i + delta)), delta]),
    [last],
  );
  const setIndex = (target: number) => setPage(([i]) => [target, target > i ? 1 : -1]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === " ") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  useEffect(() => {
    let lock: WakeLockSentinel | undefined;
    navigator.wakeLock?.request("screen").then((sentinel) => (lock = sentinel)).catch(() => {});
    return () => void lock?.release();
  }, []);

  const step = index >= 0 && index < last ? recipe.steps[index] : undefined;
  const progress = ((index + 1) / (last + 1)) * 100;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-50 dark:bg-stone-950">
      <header className="flex items-center gap-4 border-b border-stone-200 px-4 py-3 sm:px-8 dark:border-stone-800">
        <Link href={`/recipes/${recipe.id}`} className="btn-ghost !p-2" aria-label="Exit cook mode">
          <X className="size-5" />
        </Link>
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-widest text-brand-600 uppercase">Cook mode</p>
          <h1 className="truncate font-display text-lg font-semibold">{recipe.title}</h1>
        </div>
        <button type="button" onClick={() => setIndex(-1)} className="btn-ghost ml-auto" aria-label="Show ingredients">
          <List className="size-4" /> <span className="hidden sm:inline">Ingredients</span>
        </button>
      </header>
      <div className="h-1 bg-stone-200 dark:bg-stone-800">
        <motion.div className="h-full bg-brand-500" animate={{ width: `${progress}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
      </div>

      <main className="relative flex flex-1 items-center justify-center overflow-x-hidden overflow-y-auto px-6 py-10">
        <AnimatePresence mode="wait" custom={direction}>
        <motion.div key={index} className="w-full max-w-3xl" custom={direction} variants={SLIDE} initial="enter" animate="center" exit="exit">
          {index === -1 && (
            <div>
              <p className="text-sm font-semibold text-brand-600">Get everything ready</p>
              <h2 className="mt-2 font-display text-4xl font-semibold">Ingredients</h2>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {recipe.ingredients.map((ingredient, i) => (
                  <motion.li
                    key={ingredient.id}
                    className="card px-4 py-3 text-lg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 + i * 0.04, type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <strong>{formatQuantity(ingredient.quantity)} {ingredient.unit}</strong> {ingredient.name}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
          {step && (
            <div className="text-center">
              <p className="text-sm font-semibold text-brand-600">
                Step {index + 1} of {last}
              </p>
              <p className="mt-6 font-display text-3xl leading-snug sm:text-4xl">{step.instruction}</p>
              {step.timer_minutes && <StepTimer key={step.id} minutes={step.timer_minutes} large className="mt-10" />}
            </div>
          )}
          {index === last && (
            <div className="relative text-center">
              <div className="pointer-events-none absolute top-8 left-1/2" aria-hidden>
                {CONFETTI.map((piece, i) => (
                  <motion.span
                    key={i}
                    className={`absolute h-3 w-1.5 rounded-sm ${piece.color}`}
                    initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                    animate={{ x: piece.x, y: [0, -180, 320], opacity: [1, 1, 0], rotate: piece.rotate + 540 }}
                    transition={{ duration: 2.2, delay: piece.delay, ease: "easeOut" }}
                  />
                ))}
              </div>
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <PartyPopper className="mx-auto size-16 text-brand-500" />
              </motion.div>
              <h2 className="mt-6 font-display text-4xl font-semibold">Bon appétit!</h2>
              <p className="mt-3 text-stone-500">You&apos;ve finished {recipe.title}. Enjoy every bite.</p>
              <Link href={`/recipes/${recipe.id}#reviews`} className="btn-primary mt-8">
                Rate this recipe
              </Link>
            </div>
          )}
        </motion.div>
        </AnimatePresence>
      </main>

      <footer className="flex items-center justify-between gap-4 border-t border-stone-200 px-4 py-4 sm:px-8 dark:border-stone-800">
        <button type="button" onClick={() => go(-1)} disabled={index === -1} className="btn-secondary !px-6 !py-3">
          <ArrowLeft className="size-5" /> Back
        </button>
        <p className="hidden text-xs text-stone-400 sm:block">Tip: use ← → or space to move between steps</p>
        <button type="button" onClick={() => go(1)} disabled={index === last} className="btn-primary !px-6 !py-3">
          {index === -1 ? "Start cooking" : index === last - 1 ? "Finish" : "Next"} <ArrowRight className="size-5" />
        </button>
      </footer>
    </div>
  );
}
