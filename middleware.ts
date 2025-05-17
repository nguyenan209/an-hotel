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
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
}; 