// middleware.ts
// InvenStock - Multi-Tenant Inventory Management System
// UPDATED: Enhanced security monitoring for CVE-2025-55182 & CVE-2025-66478

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
  APP_ROUTES,
} from './lib/reserved-routes';
import { logSecurityEvent } from './lib/security-logger';

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

// ===== SECURITY: Detect suspicious payloads =====
function hasSuspiciousPatterns(obj: any): boolean {
  const suspicious = [
    '__proto__',
    'constructor',
    'prototype',
    'eval(',
    'Function(',
    'require(',
    'import(',
    'process.env',
  ];
  
  try {
    const str = JSON.stringify(obj);
    return suspicious.some(pattern => str.includes(pattern));
  } catch {
    return true; // Cannot serialize = suspicious
  }
}

// ===== SECURITY: Validate request payload =====
async function validateRequestPayload(request: NextRequest): Promise<boolean> {
  const contentType = request.headers.get('content-type');
  
  if (contentType?.includes('application/json')) {
    try {
      const clonedRequest = request.clone();
      const text = await clonedRequest.text();
      
      if (text) {
        const parsed = JSON.parse(text);
        
        if (hasSuspiciousPatterns(parsed)) {
          const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
          
          logSecurityEvent({
            type: 'suspicious_payload',
            ip: clientIp,
            path: request.nextUrl.pathname,
            userAgent: request.headers.get('user-agent') || undefined,
            details: {
              contentType,
              payloadSize: text.length,
            }
          });
          
          console.error('🚨 Suspicious payload detected:', {
            ip: clientIp,
            path: request.nextUrl.pathname,
          });
          
          return false;
        }
      }
    } catch (e) {
      // Invalid JSON
      return false;
    }
  }
  
  return true;
}

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

  // ===== SECURITY: Validate payload for POST/PUT/PATCH requests =====
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const isValid = await validateRequestPayload(request);
    
    if (!isValid) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request payload' 
        },
        { status: 400 }
      );
    }
  }

  // ===== ARCJET PROTECTION (AUTH ENDPOINTS ONLY) =====
  try {
    if (isAuthEndpoint(pathname)) {
      console.log(`🔐 Applying Arcjet protection to: ${pathname}`);
      
      const decision = await ajAuth.protect(request, { requested: 1 });

      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          console.log(`⛔ Auth rate limit exceeded from IP: ${clientIp}`);
          
          logSecurityEvent({
            type: 'rate_limit',
            ip: clientIp,
            path: pathname,
            userAgent: request.headers.get('user-agent') || undefined,
          });
          
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
        
        logSecurityEvent({
          type: 'shield_blocked',
          ip: clientIp,
          path: pathname,
          userAgent: request.headers.get('user-agent') || undefined,
        });
        
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

  // Check for app routes with sub-paths
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0) {
    const firstSegment = segments[0];
    
    if (APP_ROUTES.includes(firstSegment as any)) {
      console.log(`✅ App route (with sub-path): ${pathname}`);
      
      const token = request.cookies.get('auth-token')?.value;

      if (!token) {
        console.log(`❌ No token for app route ${pathname}, redirecting to login`);
        return NextResponse.redirect(new URL('/login', request.url));
      }

      try {
        const payload = await verifyToken(token);

        if (!payload || !payload.userId) {
          throw new Error('Invalid token');
        }

        console.log(`✅ User authenticated for app route: ${payload.userId}`);
        
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
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-username', payload.username);
    requestHeaders.set('x-user-email', payload.email || '');
    
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  if (route.type === 'app' || route.type === 'public') {
    return NextResponse.next();
  }

  // Validate org and dept slugs
  if (route.orgSlug && isSystemReserved(route.orgSlug)) {
    console.log(`⚠️ Reserved system slug detected: ${route.orgSlug}`);
    return NextResponse.redirect(new URL('/not-found', request.url));
  }

  if (route.deptSlug && isSystemReserved(route.deptSlug)) {
    console.log(`⚠️ Reserved system slug used as department: ${route.deptSlug}`);
    return NextResponse.redirect(new URL('/not-found', request.url));
  }

  // Handle all valid organization/department routes
  if (route.type === 'org-main' || route.type === 'org-page' || 
      route.type === 'org-settings-subpage' ||
      route.type === 'dept-main' || route.type === 'dept-page' ||
      route.type === 'dept-subpage') {
    
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

    if (route.subpage) {
      requestHeaders.set('x-subpage', route.subpage);
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