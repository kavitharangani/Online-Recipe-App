import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-shared";

/** Drops a session cookie that no longer maps to an account, then sends the visitor to log in. */
export function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
