import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { get } from "./db";
import { decrypt } from "./session";
import { SESSION_COOKIE } from "./session-shared";
import type { User } from "./types";

/**
 * The signed-in user, loaded fresh from the database so deleted accounts
 * and role changes take effect immediately. Returns null for guests.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const user = get<User>(
    "SELECT id, name, email, bio, avatar, role, created_at FROM users WHERE id = ?",
    session.userId,
  );
  return user ?? null;
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    // A cookie for a deleted account would otherwise bounce between /login and protected pages.
    const hasCookie = (await cookies()).has(SESSION_COOKIE);
    redirect(hasCookie ? "/api/session/clear" : "/login");
  }
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/");
  return user;
}
