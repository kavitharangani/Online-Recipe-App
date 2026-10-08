import Link from "next/link";
import { Reveal, SlideDown } from "./motion";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <Reveal kind="blur" className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-stone-500 dark:text-stone-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </Reveal>
  );
}

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-7xl px-4 py-10 sm:px-6 ${className}`}>{children}</div>;
}

export function EmptyState({
  emoji,
  title,
  text,
  action,
}: {
  emoji: string;
  title: string;
  text: string;
  action?: { href: string; label: string };
}) {
  return (
    <Reveal kind="zoom" className="card flex flex-col items-center px-6 py-16 text-center">
      <span className="inline-block animate-bounce text-5xl [animation-duration:2s]">{emoji}</span>
      <h2 className="mt-4 font-display text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-stone-500 dark:text-stone-400">{text}</p>
      {action && (
        <Link href={action.href} className="btn-primary mt-6">
          {action.label}
        </Link>
      )}
    </Reveal>
  );
}

export function Flash({ children, tone = "success" }: { children: React.ReactNode; tone?: "success" | "info" }) {
  return (
    <SlideDown
      className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${
        tone === "success"
          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300"
          : "bg-sky-50 text-sky-800 dark:bg-sky-500/10 dark:text-sky-300"
      }`}
    >
      <span role="status">{children}</span>
    </SlideDown>
  );
}
