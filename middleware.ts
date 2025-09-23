// middleware.ts - IMPROVED FOR SIMPLIFIED PERMISSION SYSTEM
// InvenStock - Multi-Tenant Inventory Management System
// Simplified Security Middleware with Organization-Only Validation

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';
import arcjet, { detectBot, shield, tokenBucket, slidingWindow } from "@arcjet/next";

// ===== ARCJET SECURITY CONFIGURATION =====
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        "CATEGORY:MONITOR",
      ],
    }),
    slidingWindow({
      mode: "LIVE",
      interval: "1m",
      max: 100,
    }),
    tokenBucket({
      mode: "LIVE",
      characteristics: ["ip.src"],
      refillRate: 10,
      interval: "1m",
      capacity: 20,
    }),
  ],
});

// ===== ROUTE CONFIGURATIONS =====
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/'
];

const publicApiRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/health',
  '/api/status',
  '/api/arcjet'
];

// Sensitive endpoints with stricter rate limiting
const sensitiveApiRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password'
];

// ===== NEW: Organization-scoped routes that need membership validation =====
const organizationRoutes = [
  '/org/',                      // All organization pages
  '/api/dashboard/',           // Dashboard APIs
  '/api/organizations/'        // Organization management APIs
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';

  console.log(`🔍 Middleware: ${pathname} from ${clientIp}`);

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

  // ===== ARCJET SECURITY CHECK =====
  try {
    const isSensitive = sensitiveApiRoutes.some(route => pathname.startsWith(route));
    
    const decision = await aj.protect(request, {
      requested: isSensitive ? 3 : 1
    });

    console.log(`🛡️ Arcjet decision for ${pathname}:`, {
      isDenied: decision.isDenied(),
      reason: decision.reason?.type || 'allowed'
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        console.log(`⛔ Rate limit exceeded for ${pathname} from IP: ${clientIp}`);
        return NextResponse.json(
          { 
            error: "Too Many Requests",
            message: "Please wait before trying again",
            retryAfter: isSensitive ? 300 : 60
          },
          { 
            status: 429, 
            headers: { 'Retry-After': String(isSensitive ? 300 : 60) }
          }
        );
      } 
      
      if (decision.reason.isBot()) {
        console.log(`🤖 Bot blocked for ${pathname} from IP: ${clientIp}`);
        return NextResponse.json(
          { error: "Access Denied", message: "Automated access not allowed" },
          { status: 403 }
        );
      }
      
      if (decision.reason.isShield()) {
        console.log(`🛡️ Shield blocked for ${pathname} from IP: ${clientIp}`);
        return NextResponse.json(
          { error: "Security Violation", message: "Request blocked by security filter" },
          { status: 403 }
        );
      }

      console.log(`❌ Access denied for ${pathname} from IP: ${clientIp}`);
      return NextResponse.json(
        { error: "Access Denied", message: "Request not allowed" },
        { status: 403 }
      );
    }

    if (decision.ip.isHosting() && isSensitive) {
      console.log(`⚠️ Hosting IP detected for sensitive endpoint: ${clientIp}`);
    }

  } catch (arcjetError) {
    console.error('🚨 Arcjet protection failed:', arcjetError);
  }

  // ===== AUTHENTICATION FLOW =====
  
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

    // ===== NEW: SIMPLIFIED ORGANIZATION ACCESS CHECK =====
    // Extract organization slug from URL
    const orgSlugMatch = pathname.match(/^\/org\/([^\/]+)/);
    const apiOrgMatch = pathname.match(/^\/api\/([^\/]+)\//);
    
    let organizationSlug = null;
    let organizationId = null;

    if (orgSlugMatch) {
      organizationSlug = orgSlugMatch[1];
      console.log(`📂 Organization page: ${organizationSlug}`);
    } else if (apiOrgMatch && !pathname.startsWith('/api/auth/')) {
      // For API routes like /api/[orgId]/departments/...
      organizationId = apiOrgMatch[1];
      console.log(`🔌 Organization API: ${organizationId}`);
    }

    // Add user info to request headers for API routes
    if (pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-email', payload.email || '');
      
      // Add organization context if available from JWT
      if (payload.organizationId) {
        requestHeaders.set('x-organization-id', payload.organizationId);
      }
      if (payload.role) {
        requestHeaders.set('x-role', payload.role);
      }

      // For organization-specific API routes, add the org ID from URL
      if (organizationId) {
        requestHeaders.set('x-url-organization-id', organizationId);
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // For organization pages, we'll let the page component handle validation
    // This keeps middleware simple and moves detailed checks to the page level
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