import Link from "next/link";
import { Bell, ChefHat, Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/dal";
import { getUnreadCount } from "@/lib/queries";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

export async function Navbar() {
  const user = await getCurrentUser();
  const unread = user ? getUnreadCount(user.id) : 0;

  return (
    <header className="no-print sticky top-0 z-40 border-b border-stone-200/80 bg-white/85 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-500 text-white shadow-sm shadow-brand-500/40">
            <ChefHat className="size-5" />
          </span>
          Flavorly
        </Link>

        <NavLinks signedIn={!!user} isAdmin={user?.role === "admin"} />

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          {/* Shown to everyone; guests are sent to log in and then straight back to the form. */}
          <Link href="/recipes/new" className="btn-primary !px-2.5 !py-2 sm:!px-4" aria-label="Add a new recipe">
            <Plus className="size-4" /> <span className="hidden sm:inline">{user ? "New recipe" : "Share a recipe"}</span>
          </Link>
          {user ? (
            <>
              <Link
                href="/notifications"
                className="relative grid size-10 place-items-center rounded-xl text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                aria-label={unread ? `Notifications (${unread} unread)` : "Notifications"}
              >
                <Bell className={`size-5 origin-top ${unread > 0 ? "animate-ring" : ""}`} />
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
              <UserMenu user={{ id: user.id, name: user.name, email: user.email, avatar: user.avatar, role: user.role }} />
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">Log in</Link>
              <Link href="/register" className="btn-secondary hidden sm:inline-flex">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
