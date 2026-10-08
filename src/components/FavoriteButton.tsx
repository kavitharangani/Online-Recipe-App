"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/actions/recipes";

const PARTICLES = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2;
  return { x: Math.cos(angle) * 26, y: Math.sin(angle) * 26, color: i % 2 ? "bg-brand-400" : "bg-rose-400" };
});

/** Little burst of dots when a recipe is saved. */
function Burst({ id }: { id: number }) {
  return (
    <span className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden>
      {PARTICLES.map((p, i) => (
        <motion.span
          key={`${id}-${i}`}
          className={`absolute size-1.5 rounded-full ${p.color}`}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{ x: p.x, y: p.y, scale: 0, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
      <motion.span
        className="absolute size-9 rounded-full border-2 border-brand-400"
        initial={{ scale: 0.3, opacity: 0.9 }}
        animate={{ scale: 1.6, opacity: 0 }}
        transition={{ duration: 0.5 }}
      />
    </span>
  );
}

export function FavoriteButton({
  recipeId,
  initial,
  signedIn,
  variant = "icon",
}: {
  recipeId: number;
  initial: boolean;
  signedIn: boolean;
  variant?: "icon" | "button";
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [favorited, setFavorited] = useOptimistic(initial);
  const [burst, setBurst] = useState(0);

  function onClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!signedIn) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!favorited) setBurst((n) => n + 1);
    startTransition(async () => {
      setFavorited(!favorited);
      await toggleFavorite(recipeId);
    });
  }

  const label = favorited ? "Remove from favorites" : "Save to favorites";
  const heart = (
    <motion.span
      key={favorited ? "on" : "off"}
      className="relative grid place-items-center"
      initial={favorited ? { scale: 0.4 } : false}
      animate={{ scale: [null, 1.35, 0.9, 1] }}
      transition={{ duration: 0.45 }}
    >
      <Heart className={`${variant === "icon" ? "size-4.5" : "size-4"} ${favorited ? "fill-current" : ""} ${favorited && variant === "icon" ? "text-brand-500" : ""}`} />
    </motion.span>
  );

  if (variant === "button") {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        className={`relative ${favorited ? "btn-primary" : "btn-secondary"}`}
        aria-pressed={favorited}
        whileTap={{ scale: 0.93 }}
      >
        {heart}
        {favorited ? "Saved" : "Save"}
        <AnimatePresence>{burst > 0 && favorited && <Burst key={burst} id={burst} />}</AnimatePresence>
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={favorited}
      title={label}
      className="relative grid size-9 place-items-center rounded-full bg-white/90 text-stone-700 shadow-sm backdrop-blur dark:bg-stone-900/90 dark:text-stone-200"
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.85 }}
    >
      {heart}
      <AnimatePresence>{burst > 0 && favorited && <Burst key={burst} id={burst} />}</AnimatePresence>
    </motion.button>
  );
}
