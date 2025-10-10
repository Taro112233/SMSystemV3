// FILE: lib/reserved-routes.ts - UPDATED
// Centralized Reserved Routes Management
// ============================================

/**
 * Top-level application routes (single-level paths)
 * Example: /dashboard, /profile, /settings
 */
export const APP_ROUTES = [
  'dashboard',      // ✅ UPDATED: Now includes /dashboard and /dashboard/* paths
  'profile',
  'login',
  'register',
  'not-found',
] as const;

/**
 * Organization-level pages (second-level paths)
 * Example: /{orgSlug}/settings, /{orgSlug}/members
 */
export const ORG_LEVEL_PAGES = [
  'settings',
  'members',
  'reports',
  'products',
  'transfers',
  'inventory',
  'analytics',
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
  'health',
] as const;

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/not-found',
  '/about',
  '/contact',
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

export function getAllReservedSlugs(): string[] {
  return [
    ...APP_ROUTES,
    ...ORG_LEVEL_PAGES,
    ...SYSTEM_RESERVED,
  ];
}

export function getSystemReservedSlugs(): string[] {
  return [
    ...APP_ROUTES,
    ...SYSTEM_RESERVED,
  ];
}

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname as (typeof PUBLIC_ROUTES)[number]);
}

export function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some(route => pathname.startsWith(route));
}

export function isAuthEndpoint(pathname: string): boolean {
  return AUTH_ENDPOINTS.some(route => pathname.startsWith(route));
}

export function isOrgLevelPage(slug: string): boolean {
  return ORG_LEVEL_PAGES.includes(slug.toLowerCase() as (typeof ORG_LEVEL_PAGES)[number]);
}

export function isSystemReserved(slug: string): boolean {
  const systemSlugs = getSystemReservedSlugs();
  return systemSlugs.some(reserved => reserved === slug.toLowerCase());
}

// ===== ROUTE PATTERNS =====

export const ROUTE_PATTERNS = {
  singleRoute: /^\/([a-z0-9-]+)$/,
  orgMain: /^\/([a-z0-9-]+)$/,
  orgPage: /^\/([a-z0-9-]+)\/(settings|members|reports|products|transfers|inventory|analytics)$/,
  deptMain: /^\/([a-z0-9-]+)\/([a-z0-9-]+)$/,
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
  if (pathname.startsWith('/api/')) {
    return { type: 'api' };
  }

  if (PUBLIC_ROUTES.includes(pathname as (typeof PUBLIC_ROUTES)[number])) {
    return { type: 'public' };
  }

  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length > 0) {
    const firstSegment = segments[0];
    
    // ✅ UPDATED: Check for app routes with sub-paths (e.g., /dashboard/settings/profile)
    if (APP_ROUTES.includes(firstSegment as (typeof APP_ROUTES)[number])) {
      return { type: 'app' };
    }
  }

  if (segments.length === 0) {
    return { type: 'invalid' };
  }

  if (segments.length === 1) {
    const slug = segments[0];
    return {
      type: 'org-main',
      orgSlug: slug,
    };
  }

  if (segments.length === 2) {
    const [orgSlug, secondSegment] = segments;
    
    if (isOrgLevelPage(secondSegment)) {
      return {
        type: 'org-page',
        orgSlug,
        page: secondSegment,
      };
    }
    
    return {
      type: 'dept-main',
      orgSlug,
      deptSlug: secondSegment,
    };
  }

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