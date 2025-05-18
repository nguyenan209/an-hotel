import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/google',
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
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }
  if (pathname.startsWith('/api/')) {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }
    const decoded = decodeJwt(token);
    if (!decoded || !decoded.userId || !decoded.role) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-role', decoded.role);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }
  const adminPath = /^\/admin(\/.*)?$/;
  const loginPath = '/login';

  // Get cookie from the request headers
  // Replace 'your-auth-cookie-name' with the actual name of your authentication cookie
  const isAuthenticated = request.cookies.has('token');

  // If the user is trying to access an admin path AND is not authenticated
  if (request.nextUrl.pathname.match(adminPath) && !isAuthenticated) {
    // Redirect them to the login page
    const loginUrl = new URL(loginPath, request.url);
    // Optional: Add a redirect back parameter so the user is sent to the page they wanted after logging in
    // loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow the request to continue if accessing non-admin paths or is authenticated
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*', // Apply middleware to all paths under /admin
    // Add other paths if needed, e.g., '/api/admin/:path*'
  ],
}; 