// middleware.ts - FIXED VERSION
// InvenStock - Multi-Tenant Inventory Management System
// Basic Authentication Middleware (Next.js 15 Compatible)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

// Public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/'
];

// Public API routes that don't require authentication
const publicApiRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/health',
  '/api/status',
  '/api/arcjet'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log(`🔍 Middleware: ${pathname}`);

  // Skip static files and public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/robots') ||
    (pathname.includes('.') && !pathname.includes('/api/'))
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    console.log(`✅ Public route: ${pathname}`);
    return NextResponse.next();
  }

  // Allow public API routes
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    console.log(`✅ Public API route: ${pathname}`);
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get('auth-token')?.value;

  // No token - redirect to login
  if (!token) {
    console.log(`❌ No token, redirecting to login`);
    
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token
  try {
    const payload = await verifyToken(token);

    if (!payload || !payload.userId) {
      console.log(`❌ Invalid token payload`);
      throw new Error('Invalid token');
    }

    console.log(`✅ User authenticated: ${payload.userId}`);

    // Add user info to request headers for API routes
    if (pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-email', payload.email || '');
      
      // Add organization context if available
      if (payload.organizationId) {
        requestHeaders.set('x-organization-id', payload.organizationId);
      }
      if (payload.roleId) {
        requestHeaders.set('x-role-id', payload.roleId);
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // For organization-scoped routes, check if user has organization access
    const orgIdMatch = pathname.match(/^\/org\/([^\/]+)/);
    if (orgIdMatch) {
      const requestedOrgId = orgIdMatch[1];
      
      // If user has organization in JWT, check if it matches
      if (payload.organizationId && payload.organizationId !== requestedOrgId) {
        console.log(`❌ Organization mismatch: ${payload.organizationId} vs ${requestedOrgId}`);
        return NextResponse.redirect(new URL('/select-organization', request.url));
      }
      
      // If no organization in JWT, redirect to select organization
      if (!payload.organizationId) {
        console.log(`❌ No organization context`);
        return NextResponse.redirect(new URL('/select-organization', request.url));
      }
    }

    return NextResponse.next();

  } catch (error) {
    console.error('❌ Token verification failed:', error);

    // Clear invalid token
    const response = pathname.startsWith('/api/')
      ? NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        )
      : NextResponse.redirect(new URL('/login', request.url));

    response.cookies.delete('auth-token');
    return response;
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, manifest.json, robots.txt (public files)
     * - images, icons (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|robots.txt|images|icons).*)',
  ],
};