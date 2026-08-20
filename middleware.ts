import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { isStagingEnv } from '@/app/helpers/app-env';
import { BROWSE_CLEARANCE_COOKIE } from '@/app/helpers/browse-gate';

const marketerApp = (
  process.env.NEXT_PUBLIC_MARKETER_PORTAL_URL || 'http://localhost:3005'
).replace(/\/$/, '');

function isBrowseGateEnabled(): boolean {
  if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) return false;
  return isStagingEnv() || process.env.NEXT_PUBLIC_BROWSE_GATE_ENABLED === 'true';
}

function isPublicAsset(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|map)$/i.test(pathname)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/marketer')) {
    const rest = pathname.slice('/marketer'.length);
    const path = rest === '' || rest === '/' ? '/login' : rest;
    return NextResponse.redirect(new URL(path, marketerApp));
  }

  if (
    !isBrowseGateEnabled() ||
    isPublicAsset(pathname) ||
    pathname === '/verify' ||
    pathname === '/up'
  ) {
    return NextResponse.next();
  }

  const clearance = request.cookies.get(BROWSE_CLEARANCE_COOKIE)?.value;
  if (clearance) {
    return NextResponse.next();
  }

  const returnTo = encodeURIComponent(`${pathname}${request.nextUrl.search}`);
  const verifyUrl = request.nextUrl.clone();
  verifyUrl.pathname = '/verify';
  verifyUrl.search = `returnTo=${returnTo}`;
  return NextResponse.redirect(verifyUrl);
}

export const config = {
  matcher: [
    '/marketer',
    '/marketer/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
