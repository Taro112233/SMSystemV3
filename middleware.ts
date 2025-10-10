// FILE: middleware.ts - UPDATED: Better handling for app routes with sub-paths
// InvenStock - Multi-Tenant Inventory Management System

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';
import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/next";
import {
  isPublicRoute,
  isPublicApiRoute,
  isAuthEndpoint,
  parseRoute,
  isSystemReserved,
  APP_ROUTES, // ✅ Import APP_ROUTES
} from './lib/reserved-routes';

// ===== ARCJET SECURITY (AUTH ENDPOINTS ONLY) =====
const ajAuth = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:MONITOR"],
    }),
    tokenBucket({
      mode: "LIVE",
      characteristics: ["ip.src"],
      refillRate: 3,
      interval: "5m",
      capacity: 5,
    }),
  ],
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';

  console.log(`🔍 Middleware: ${pathname} from ${clientIp}`);

  // ===== SKIP STATIC FILES =====
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

  // ===== ARCJET PROTECTION (AUTH ENDPOINTS ONLY) =====
  try {
    if (isAuthEndpoint(pathname)) {
      console.log(`🔐 Applying Arcjet protection to: ${pathname}`);
      
      const decision = await ajAuth.protect(request, { requested: 1 });

      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          console.log(`⛔ Auth rate limit exceeded from IP: ${clientIp}`);
          return NextResponse.json(
            { 
              success: false,
              error: "Too many authentication attempts",
              retryAfter: 300
            },
            { status: 429, headers: { 'Retry-After': '300' } }
          );
        } 
        
        console.log(`🛡️ Auth request blocked from IP: ${clientIp}`);
        return NextResponse.json(
          { success: false, error: "Access denied" },
          { status: 403 }
        );
      }
    }
  } catch (arcjetError) {
    console.error('🚨 Arcjet protection failed:', arcjetError);
  }

  // ===== CHECK IF ROUTE REQUIRES AUTH =====
  if (isPublicRoute(pathname) || isPublicApiRoute(pathname)) {
    console.log(`✅ Public route: ${pathname}`);
    return NextResponse.next();
  }

  // ✅ NEW: Check for app routes with sub-paths (e.g., /settings/profile)
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0) {
    const firstSegment = segments[0];
    
    // Check if this is an app route (including sub-paths)
    if (APP_ROUTES.includes(firstSegment as any)) {
      console.log(`✅ App route (with sub-path): ${pathname}`);
      
      // Still require authentication for app routes
      const token = request.cookies.get('auth-token')?.value;

      if (!token) {
        console.log(`❌ No token for app route ${pathname}, redirecting to login`);
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Verify token
      try {
        const payload = await verifyToken(token);

        if (!payload || !payload.userId) {
          throw new Error('Invalid token');
        }

        console.log(`✅ User authenticated for app route: ${payload.userId}`);
        
        // Pass with user headers
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', payload.userId);
        requestHeaders.set('x-username', payload.username);
        requestHeaders.set('x-user-email', payload.email || '');
        
        return NextResponse.next({
          request: { headers: requestHeaders },
        });

      } catch (error) {
        console.log(`❌ Token verification failed for ${pathname}`);
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth-token');
        return response;
      }
    }
  }

  // ===== AUTH REQUIRED - CHECK TOKEN =====
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    console.log(`❌ No token for ${pathname}, redirecting to login`);
    
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token
  let payload;
  try {
    payload = await verifyToken(token);

    if (!payload || !payload.userId) {
      throw new Error('Invalid token');
    }

    console.log(`✅ User authenticated: ${payload.userId}`);
  } catch (error) {
    console.log(`❌ Token verification failed for ${pathname}`);

    const response = pathname.startsWith('/api/')
      ? NextResponse.json(
          { success: false, error: 'Invalid or expired token' },
          { status: 401 }
        )
      : NextResponse.redirect(new URL('/login', request.url));

    response.cookies.delete('auth-token');
    return response;
  }

  // ===== ROUTE VALIDATION USING CENTRALIZED PARSER =====
  const route = parseRoute(pathname);

  // Handle different route types
  if (route.type === 'api') {
    // API routes - pass with user headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-username', payload.username);
    requestHeaders.set('x-user-email', payload.email || '');
    
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  if (route.type === 'app' || route.type === 'public') {
    // App routes or public routes
    return NextResponse.next();
  }

  // ✅ Validate org and dept slugs
  if (route.orgSlug && isSystemReserved(route.orgSlug)) {
    console.log(`⚠️ Reserved system slug detected: ${route.orgSlug}`);
    return NextResponse.redirect(new URL('/not-found', request.url));
  }

  if (route.deptSlug && isSystemReserved(route.deptSlug)) {
    console.log(`⚠️ Reserved system slug used as department: ${route.deptSlug}`);
    return NextResponse.redirect(new URL('/not-found', request.url));
  }

  // ✅ Handle valid organization routes
  if (route.type === 'org-main' || route.type === 'org-page' || 
      route.type === 'dept-main' || route.type === 'dept-page') {
    
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-username', payload.username);
    requestHeaders.set('x-user-email', payload.email || '');
    requestHeaders.set('x-current-org', route.orgSlug!);
    requestHeaders.set('x-org-check-required', 'true');
    
    if (route.page) {
      requestHeaders.set('x-org-page', route.page);
    }
    
    if (route.deptSlug) {
      requestHeaders.set('x-current-dept', route.deptSlug);
    }

    console.log(`✅ Valid ${route.type}: ${pathname}`);
    
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // Invalid route
  console.log(`❌ Invalid route: ${pathname}`);
  return NextResponse.redirect(new URL('/not-found', request.url));
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|robots.txt|images|icons).*)',
  ],
};