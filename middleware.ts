import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/google',
  '/api/homestays',
  '/api/rooms',
  '/api/reviews',
  '/api/payment/session',
  '/api/payment/checkout/bank-transfer'
];

function decodeJwt(token: string): any {
  try {
    const payload = token.split('.')[1];
    // atob is available in Edge runtime
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  if (pathname.startsWith('/api/')) {
    // Lấy token từ header hoặc cookie
    let token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      token = request.cookies.get('token')?.value;
    }
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }
    const decoded = decodeJwt(token);
    if (!decoded || !decoded.id || !decoded.role) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-role', decoded.role);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const adminPath = /^\/admin(\/.*)?$/;
  const ownerPath = /^\/owner(\/.*)?$/;
  const loginPath = '/login';

  // Get cookie from the request headers
  const token = request.cookies.get('token')?.value;
  const isAuthenticated = !!token;

  // If not authenticated, redirect to login
  if (!isAuthenticated && (request.nextUrl.pathname.match(adminPath) || request.nextUrl.pathname.match(ownerPath))) {
    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated, check role for owner path
  if (isAuthenticated && request.nextUrl.pathname.match(ownerPath)) {
    const decoded = decodeJwt(token);
    if (!decoded || decoded.role !== 'OWNER') {
      // Redirect to home page if not an owner
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Allow the request to continue if all checks pass
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/owner/:path*',
    '/api/:path*'
  ],
}; 