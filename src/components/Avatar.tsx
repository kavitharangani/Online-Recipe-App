import { initials } from "@/lib/format";

const SIZES = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-xl",
  xl: "size-24 text-3xl",
};

const PALETTE = ["bg-brand-500", "bg-emerald-600", "bg-sky-600", "bg-violet-600", "bg-rose-600", "bg-amber-600"];

export function Avatar({ name, src, size = "md" }: { name: string; src?: string | null; size?: keyof typeof SIZES }) {
  const classes = `${SIZES[size]} shrink-0 rounded-full object-cover ring-2 ring-white dark:ring-stone-900`;
  if (src) return <img src={src} alt={name} className={classes} />;
  const color = PALETTE[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % PALETTE.length];
  return (
    <span className={`${classes} ${color} grid place-items-center font-semibold text-white`} aria-hidden>
      {initials(name) || "?"}
    </span>
  );
}
