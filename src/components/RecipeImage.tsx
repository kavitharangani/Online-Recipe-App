const GRADIENTS = [
  "from-orange-200 via-amber-100 to-rose-200 dark:from-orange-900/60 dark:via-amber-900/40 dark:to-rose-900/60",
  "from-lime-200 via-emerald-100 to-teal-200 dark:from-lime-900/60 dark:via-emerald-900/40 dark:to-teal-900/60",
  "from-rose-200 via-pink-100 to-orange-200 dark:from-rose-900/60 dark:via-pink-900/40 dark:to-orange-900/60",
  "from-yellow-200 via-orange-100 to-red-200 dark:from-yellow-900/60 dark:via-orange-900/40 dark:to-red-900/60",
  "from-sky-200 via-cyan-100 to-emerald-200 dark:from-sky-900/60 dark:via-cyan-900/40 dark:to-emerald-900/60",
  "from-violet-200 via-fuchsia-100 to-rose-200 dark:from-violet-900/60 dark:via-fuchsia-900/40 dark:to-rose-900/60",
];

/** The recipe photo, or a warm gradient with the category emoji when there isn't one. */
export function RecipeImage({
  id,
  src,
  title,
  emoji,
  className = "",
  emojiClass = "text-6xl",
}: {
  id: number;
  src: string | null;
  title: string;
  emoji: string | null;
  className?: string;
  emojiClass?: string;
}) {
  if (src) return <img src={src} alt={title} className={`object-cover ${className}`} />;
  return (
    <div
      className={`grid place-items-center bg-gradient-to-br ${GRADIENTS[id % GRADIENTS.length]} ${className}`}
      role="img"
      aria-label={title}
    >
      <span className={`${emojiClass} drop-shadow-sm`}>{emoji ?? "🍽️"}</span>
    </div>
  );
}
