import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'mak-enterprises-secure-key-0000000');

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('mak-auth-session')?.value;

  // Basic protections skipping core assets and login page itself
  if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/api/auth') || request.nextUrl.pathname.startsWith('/_next') || request.nextUrl.pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify using only default algorithms to avoid compression bloat
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256']
    });
    
    // Explicit RBAC Check Examples (intercepting specific top tier routes)
    const role = payload.role as string;
    
    // Hard restrictions on Super Admin
    if (request.nextUrl.pathname.startsWith('/credit-notes') && role !== 'SUPER_ADMIN') {
      return new NextResponse("UNAUTHORIZED. Super Admin context required for structural financial adjustments.", { status: 403 });
    }

    // Role propagation into headers for backend Server Actions to consume safely
    const reqHeaders = new Headers(request.headers);
    reqHeaders.set('x-user-id', payload.sub || '');
    reqHeaders.set('x-user-role', role);

    return NextResponse.next({
      request: {
        headers: reqHeaders,
      }
    });

  } catch (error) {
    // Bad or expired JWT token
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('mak-auth-session');
    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'], // Match all routes
};
