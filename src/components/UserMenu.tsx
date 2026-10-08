"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BookOpen, CalendarDays, Heart, LayoutDashboard, LogOut, Settings, Shield, ShoppingCart, User } from "lucide-react";
import { logout } from "@/actions/auth";
import { Avatar } from "./Avatar";

type MenuUser = { id: number; name: string; email: string; avatar: string | null; role: string };

export function UserMenu({ user }: { user: MenuUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: `/profile/${user.id}`, label: "My profile", icon: User },
    { href: "/my-recipes", label: "My recipes", icon: BookOpen },
    { href: "/favorites", label: "Favorites", icon: Heart },
    { href: "/planner", label: "Meal planner", icon: CalendarDays },
    { href: "/shopping-list", label: "Shopping list", icon: ShoppingCart },
    { href: "/settings", label: "Settings", icon: Settings },
    ...(user.role === "admin" ? [{ href: "/admin", label: "Admin panel", icon: Shield }] : []),
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center rounded-full p-0.5 hover:ring-2 hover:ring-brand-200 dark:hover:ring-brand-500/30"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        <Avatar name={user.name} src={user.avatar} size="sm" />
      </button>
      <AnimatePresence>
      {open && (
        <motion.div
          role="menu"
          className="card absolute right-0 mt-2 w-64 origin-top-right overflow-hidden p-1.5 shadow-xl"
          initial={{ opacity: 0, scale: 0.85, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -6, transition: { duration: 0.12 } }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
        >
          <div className="border-b border-stone-100 px-3 py-2.5 dark:border-stone-800">
            <p className="truncate font-semibold">{user.name}</p>
            <p className="truncate text-xs text-stone-500">{user.email}</p>
          </div>
          <div className="py-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
              >
                <Icon className="size-4 text-stone-400" /> {label}
              </Link>
            ))}
          </div>
          <form action={logout} className="border-t border-stone-100 pt-1 dark:border-stone-800">
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              <LogOut className="size-4" /> Log out
            </button>
          </form>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
