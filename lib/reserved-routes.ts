// lib/reserved-routes.ts
// Centralized Reserved Routes Management
// ============================================
// ⚠️ เมื่อเพิ่ม route ใหม่ แก้ที่นี่ที่เดียว

/**
 * Top-level application routes (single-level paths)
 * Example: /dashboard, /profile, /settings
 */
export const APP_ROUTES = [
  'dashboard',
  'profile',
  'settings',
  'login',
  'register',
  'not-found',
] as const;

/**
 * Organization-level pages (second-level paths)
 * Example: /{orgSlug}/settings, /{orgSlug}/members
 * 
 * ⚠️ WARNING: These can be used as department slugs but NOT as org slugs
 */
export const ORG_LEVEL_PAGES = [
  'settings',
  'members',
  'reports',
  'products',
  'transfers',
  'inventory',    // ✅ เพิ่มใหม่: /inventory management
  'analytics',    // ✅ เพิ่มใหม่: /analytics dashboard
] as const;

/**
 * System reserved paths (cannot be used as org or dept slugs)
 */
export const SYSTEM_RESERVED = [
  'api',
  '_next',
  'static',
  'images',
  'icons',
  'favicon',
  'manifest',
  'robots',
  'admin',
  'system',
  'root',
  'public',
  'private',
  'auth',
  'user',
  'users',
  'health',      // ✅ เพิ่มใหม่: /api/health endpoint
] as const;

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/not-found',
  '/about',      // ✅ เพิ่มใหม่: About page
  '/contact',    // ✅ เพิ่มใหม่: Contact page
] as const;

/**
 * Public API routes (no auth required)
 */
export const PUBLIC_API_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/health',
  '/api/arcjet',
] as const;

/**
 * Auth-protected API endpoints (require Arcjet protection)
 */
export const AUTH_ENDPOINTS = [
  '/api/auth/login',
  '/api/auth/register',
] as const;

// ===== HELPER FUNCTIONS =====

/**
 * Get all reserved slugs (for validation)
 */
export function getAllReservedSlugs(): string[] {
  return [
    ...APP_ROUTES,
    ...ORG_LEVEL_PAGES,
    ...SYSTEM_RESERVED,
  ];
}

/**
 * Get system-level reserved slugs only
 */
export function getSystemReservedSlugs(): string[] {
  return [
    ...APP_ROUTES,
    ...SYSTEM_RESERVED,
  ];
}

/**
 * Check if path is a public route
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname as (typeof PUBLIC_ROUTES)[number]);
}

/**
 * Check if path is a public API route
 */
export function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if path is an auth endpoint
 */
export function isAuthEndpoint(pathname: string): boolean {
  return AUTH_ENDPOINTS.some(route => pathname.startsWith(route));
}

/**
 * Check if slug is reserved for org-level pages
 */
export function isOrgLevelPage(slug: string): boolean {
  return ORG_LEVEL_PAGES.includes(slug.toLowerCase() as (typeof ORG_LEVEL_PAGES)[number]);
}

/**
 * Check if slug is system reserved
 */
export function isSystemReserved(slug: string): boolean {
  const systemSlugs = getSystemReservedSlugs();
  return systemSlugs.some(reserved => reserved === slug.toLowerCase());
}

// ===== ROUTE PATTERNS =====

/**
 * Valid route patterns for organization URLs
 */
export const ROUTE_PATTERNS = {
  // Single-level routes
  singleRoute: /^\/([a-z0-9-]+)$/,
  
  // Organization routes: /{orgSlug}
  orgMain: /^\/([a-z0-9-]+)$/,
  
  // Organization pages: /{orgSlug}/{page}
  orgPage: /^\/([a-z0-9-]+)\/(settings|members|reports|products|transfers|inventory|analytics)$/,
  
  // Department routes: /{orgSlug}/{deptSlug}
  deptMain: /^\/([a-z0-9-]+)\/([a-z0-9-]+)$/,
  
  // Department pages: /{orgSlug}/{deptSlug}/{page}
  deptPage: /^\/([a-z0-9-]+)\/([a-z0-9-]+)\/(stocks|transfers|products)$/,
} as const;

/**
 * Parse URL and determine route type
 */
export function parseRoute(pathname: string): {
  type: 'public' | 'app' | 'org-main' | 'org-page' | 'dept-main' | 'dept-page' | 'api' | 'invalid';
  orgSlug?: string;
  deptSlug?: string;
  page?: string;
} {
  // Check API routes FIRST (before public routes)
  if (pathname.startsWith('/api/')) {
    return { type: 'api' };
  }

  // Check exact public routes (must match exactly)
  if (PUBLIC_ROUTES.includes(pathname as (typeof PUBLIC_ROUTES)[number])) {
    return { type: 'public' };
  }

  // Check app routes (exact match only)
  const pathWithoutSlash = pathname.substring(1);
  if (APP_ROUTES.includes(pathWithoutSlash as (typeof APP_ROUTES)[number])) {
    return { type: 'app' };
  }

  // Try to match org/dept patterns
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length === 0) {
    return { type: 'invalid' };
  }

  // Single segment: /{orgSlug}
  if (segments.length === 1) {
    const slug = segments[0];
    
    // Check if it's a reserved app route
    if (APP_ROUTES.includes(slug as (typeof APP_ROUTES)[number])) {
      return { type: 'app' };
    }
    
    return {
      type: 'org-main',
      orgSlug: slug,
    };
  }

  // Two segments: /{orgSlug}/{second}
  if (segments.length === 2) {
    const [orgSlug, secondSegment] = segments;
    
    // Check if second segment is an org-level page
    if (isOrgLevelPage(secondSegment)) {
      return {
        type: 'org-page',
        orgSlug,
        page: secondSegment,
      };
    }
    
    // Otherwise it's a department
    return {
      type: 'dept-main',
      orgSlug,
      deptSlug: secondSegment,
    };
  }

  // Three segments: /{orgSlug}/{deptSlug}/{page}
  if (segments.length === 3) {
    const [orgSlug, deptSlug, page] = segments;
    
    return {
      type: 'dept-page',
      orgSlug,
      deptSlug,
      page,
    };
  }

  return { type: 'invalid' };
}

// ===== TYPE EXPORTS =====
export type AppRoute = (typeof APP_ROUTES)[number];
export type OrgLevelPage = (typeof ORG_LEVEL_PAGES)[number];
export type SystemReserved = (typeof SYSTEM_RESERVED)[number];
export type PublicRoute = (typeof PUBLIC_ROUTES)[number];
export type RouteType = ReturnType<typeof parseRoute>['type'];