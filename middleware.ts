import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/profile',
  '/events',
  '/admin',
  '/blog/new',
  '/blog/create',
  '/blog/edit',
];

const PROTECTED_EXACT = ['/blog', '/blog/', '/events', '/profile', '/dashboard'];

const isProtectedPath = (pathname: string) => {
  if (PROTECTED_EXACT.includes(pathname)) {
    return true;
  }

  return PROTECTED_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
};

const isAuthRoute = (pathname: string) =>
  AUTH_ROUTES.some((route) => pathname.startsWith(route));

const isPublicAsset = (pathname: string) =>
  pathname.startsWith('/_next') ||
  pathname.startsWith('/api/auth') ||
  pathname.startsWith('/public') ||
  pathname.startsWith('/assets') ||
  pathname.endsWith('.png') ||
  pathname.endsWith('.jpg') ||
  pathname.endsWith('.svg') ||
  pathname.endsWith('.ico');

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicAsset(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (token && isAuthRoute(pathname)) {
    const dashboardUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  if (!token && isProtectedPath(pathname)) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
