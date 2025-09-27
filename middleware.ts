// middleware.ts - SIMPLIFIED SECURITY (MVP Level)
// InvenStock - Multi-Tenant Inventory Management System

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';
import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/next";

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
      refillRate: 3,        // 3 attempts per 5 minutes
      interval: "5m",
      capacity: 5,
    }),
  ],
});

// ===== ROUTE CONFIGURATIONS =====
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/not-found'
];

const publicApiRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/health',
  '/api/arcjet'
];

const authEndpoints = [
  '/api/auth/login',
  '/api/auth/register'
];

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

  // ===== STEP 3: ARCJET PROTECTION (AUTH ENDPOINTS ONLY) =====
  try {
    const isAuthEndpoint = authEndpoints.some(route => pathname.startsWith(route));
    
    if (isAuthEndpoint) {
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
    // Fail open for availability
  }

  // ===== STEP 1: CHECK IF ROUTE REQUIRES AUTH =====
  const isPublicRoute = publicRoutes.includes(pathname);
  const isPublicApi = publicApiRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute || isPublicApi) {
    console.log(`✅ Public route: ${pathname}`);
    return NextResponse.next();
  }

  // ===== STEP 1: AUTH REQUIRED - CHECK TOKEN =====
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

    // Clear invalid token
    const response = pathname.startsWith('/api/')
      ? NextResponse.json(
          { success: false, error: 'Invalid or expired token' },
          { status: 401 }
        )
      : NextResponse.redirect(new URL('/login', request.url));

    response.cookies.delete('auth-token');
    return response;
  }

  // ===== STEP 2: CHECK IF VALID ROUTE EXISTS =====
  // Organization routes pattern: /org/[orgSlug]/...
  const orgMatch = pathname.match(/^\/org\/([^\/]+)/);
  
  // Valid app routes (add more as needed)
  const validRoutes = [
    '/dashboard',
    '/profile',
    '/settings'
  ];

  const isValidSingleRoute = validRoutes.includes(pathname);
  const isValidOrgRoute = orgMatch !== null;
  const isValidApiRoute = pathname.startsWith('/api/');

  if (!isValidSingleRoute && !isValidOrgRoute && !isValidApiRoute) {
    console.log(`❌ Invalid route: ${pathname}, redirecting to not-found`);
    return NextResponse.redirect(new URL('/not-found', request.url));
  }

  // ===== PASS USER DATA TO HEADERS =====
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-username', payload.username);
  requestHeaders.set('x-user-email', payload.email || '');

  // For organization routes, add org context
  if (orgMatch) {
    const orgSlug = orgMatch[1];
    requestHeaders.set('x-current-org', orgSlug);
    requestHeaders.set('x-org-check-required', 'true');
    console.log(`📂 Organization route: ${orgSlug}`);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|robots.txt|images|icons).*)',
  ],
};