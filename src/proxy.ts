import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/session-shared";

const PROTECTED = ["/dashboard", "/my-recipes", "/favorites", "/planner", "/shopping-list", "/settings", "/notifications", "/admin", "/recipes/new"];
const GUEST_ONLY = ["/login", "/register"];

async function readSession(token: string | undefined) {
  if (!token) return null;
  try {
    const key = new TextEncoder().encode(process.env.SESSION_SECRET ?? "flavorly-development-only-secret");
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload as { userId: number; role: string };
  } catch {
    return null;
  }
}

/**
 * Optimistic auth redirects based on the session cookie alone.
 * Pages and Server Actions still verify the user against the database.
 */
export default async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await readSession(request.cookies.get(SESSION_COOKIE)?.value);

  const needsAuth =
    PROTECTED.some((route) => pathname === route || pathname.startsWith(`${route}/`)) ||
    /^\/recipes\/\d+\/edit$/.test(pathname);

  if (needsAuth && !session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  if (GUEST_ONLY.includes(pathname) && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|uploads|_next/static|_next/image|favicon.ico).*)"],
};
