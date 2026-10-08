"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutGrid, Tags, Users } from "lucide-react";

const TABS = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/recipes", label: "Recipes", icon: BookOpen },
  { href: "/admin/categories", label: "Categories", icon: Tags },
];

export function AdminTabs() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-stone-200 dark:border-stone-800">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition ${
              active ? "border-brand-500 text-brand-700 dark:text-brand-300" : "border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
            }`}
          >
            <Icon className="size-4" /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
