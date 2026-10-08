"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  function toggle() {
    const dark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {
      // Storage can be unavailable (private mode); the toggle still works for this visit.
    }
  }

  // Both icons stay mounted; the theme class swaps them with a spin-and-scale.
  return (
    <button
      type="button"
      onClick={toggle}
      className="relative grid size-10 place-items-center overflow-hidden rounded-xl text-stone-600 transition hover:bg-stone-100 active:scale-90 dark:text-stone-300 dark:hover:bg-stone-800"
      aria-label="Toggle dark mode"
    >
      <Moon className="absolute size-5 transition-all duration-500 dark:-rotate-90 dark:scale-0 dark:opacity-0" />
      <Sun className="absolute size-5 scale-0 rotate-90 opacity-0 transition-all duration-500 dark:scale-100 dark:rotate-0 dark:opacity-100" />
    </button>
  );
}
