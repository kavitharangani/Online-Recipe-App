"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, stagger } from "motion/react";
import { Menu, X } from "lucide-react";

type Item = { href: string; label: string };

export function NavLinks({ signedIn, isAdmin }: { signedIn: boolean; isAdmin: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const main: Item[] = [
    { href: "/recipes", label: "Recipes" },
    { href: "/categories", label: "Categories" },
    ...(signedIn
      ? [
          { href: "/planner", label: "Meal planner" },
          { href: "/shopping-list", label: "Shopping list" },
        ]
      : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];
  const extra: Item[] = signedIn
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/recipes/new", label: "New recipe" },
        { href: "/my-recipes", label: "My recipes" },
        { href: "/favorites", label: "Favorites" },
        { href: "/settings", label: "Settings" },
      ]
    : [
        { href: "/recipes/new", label: "Share a recipe" },
        { href: "/login", label: "Log in" },
        { href: "/register", label: "Create account" },
      ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <nav className="hidden items-center gap-1 lg:flex">
        {main.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative isolate rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active ? "text-brand-700 dark:text-brand-300" : "text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white"
              }`}
            >
              {/* The pill glides between links instead of jumping. */}
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 -z-10 rounded-lg bg-brand-50 dark:bg-brand-500/10"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <motion.button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="order-last grid size-10 place-items-center rounded-xl text-stone-600 hover:bg-stone-100 lg:hidden dark:text-stone-300 dark:hover:bg-stone-800"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        whileTap={{ scale: 0.85 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "open"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute inset-x-0 top-16 overflow-hidden border-b border-stone-200 bg-white shadow-lg lg:hidden dark:border-stone-800 dark:bg-stone-950"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
          >
            <motion.nav
              className="grid gap-1 px-4 py-4"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { delayChildren: stagger(0.035, { startDelay: 0.05 }) } } }}
            >
              {[...main, ...extra].map((item) => (
                <motion.div key={item.href} variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } }}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                      isActive(item.href)
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                        : "text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
