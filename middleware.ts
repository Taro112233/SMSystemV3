// middleware.ts - FIXED ARCJET PROPERTIES (SIMPLIFIED)
// InvenStock - Multi-Tenant Inventory Management System
// Simplified Security Middleware with Arcjet Integration

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';
import arcjet, { detectBot, shield, tokenBucket, slidingWindow } from "@arcjet/next";

// ===== ARCJET SECURITY CONFIGURATION =====
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    // Shield against common attacks (SQL injection, XSS, etc.)
    shield({ mode: "LIVE" }),
    
    // Bot detection - allow search engines but block malicious bots
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, DuckDuckGo
        "CATEGORY:MONITOR",       // Uptime monitoring (Pingdom, etc.)
      ],
    }),
    
    // Global rate limiting - prevents abuse
    slidingWindow({
      mode: "LIVE",
      interval: "1m",        // 1 minute window
      max: 100,              // 100 requests per minute per IP
    }),
    
    // Burst protection for login attempts
    tokenBucket({
      mode: "LIVE",
      characteristics: ["ip.src"], // Track by IP
      refillRate: 10,        // 10 tokens per interval
      interval: "1m",        // Refill every minute
      capacity: 20,          // Bucket capacity
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

// Rate limit sensitive endpoints more strictly
const sensitiveApiRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
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
    // Apply different rate limits based on route sensitivity
    const isSensitive = sensitiveApiRoutes.some(route => pathname.startsWith(route));
    
    const decision = await aj.protect(request, {
      // Use more tokens for sensitive endpoints
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
            retryAfter: isSensitive ? 300 : 60 // Longer retry for sensitive endpoints
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

      // General denial
      console.log(`❌ Access denied for ${pathname} from IP: ${clientIp}`);
      return NextResponse.json(
        { error: "Access Denied", message: "Request not allowed" },
        { status: 403 }
      );
    }

    // Log hosting IP detection for monitoring (don't block)
    if (decision.ip.isHosting() && isSensitive) {
      console.log(`⚠️ Hosting IP detected for sensitive endpoint: ${clientIp}`);
      // Just log, don't block (many legitimate users use VPNs)
    }

  } catch (arcjetError) {
    console.error('🚨 Arcjet protection failed:', arcjetError);
    // Don't block request if Arcjet fails - fail open for availability
  }

  // ===== STANDARD AUTHENTICATION FLOW =====
  
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
      if (payload.role) {
        requestHeaders.set('x-role', payload.role);
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
      const requestedOrgSlug = orgIdMatch[1];
      console.log(`📂 Organization route: ${requestedOrgSlug}`);
      // TODO: Implement proper organization access checking
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