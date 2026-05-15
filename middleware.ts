import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const marketerApp = (
  process.env.NEXT_PUBLIC_MARKETER_PORTAL_URL || "http://localhost:3005"
).replace(/\/$/, "");

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/marketer")) {
    return NextResponse.next();
  }

  const rest = pathname.slice("/marketer".length);
  const path = rest === "" || rest === "/" ? "/login" : rest;
  return NextResponse.redirect(new URL(path, marketerApp));
}

export const config = {
  matcher: ["/marketer", "/marketer/:path*"],
};
