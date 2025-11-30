// FILE: lib/reserved-routes.ts - FIXED
// Centralized Reserved Routes Management
// ============================================

/**
 * Top-level application routes (single-level paths)
 * Example: /dashboard, /profile, /settings
 */
export const APP_ROUTES = [
  'dashboard',
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
 * Department-level pages (third-level paths)
 * Example: /{orgSlug}/{deptSlug}/stocks, /{orgSlug}/{deptSlug}/transfers
 */
export const DEPT_LEVEL_PAGES = [
  'stocks',
  'transfers',
  'products',
  'reports',
] as const;

/**
 * Settings sub-pages (allowed after /{orgSlug}/settings/)
 * Example: /{orgSlug}/settings/categories, /{orgSlug}/settings/units
 */
export const SETTINGS_SUBPAGES = [
  'categories',
  'units',
  'departments',
  'organization',
  'members',
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
    ...DEPT_LEVEL_PAGES,
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

export function isDeptLevelPage(slug: string): boolean {
  return DEPT_LEVEL_PAGES.includes(slug.toLowerCase() as (typeof DEPT_LEVEL_PAGES)[number]);
}

export function isSettingsSubpage(slug: string): boolean {
  return SETTINGS_SUBPAGES.includes(slug.toLowerCase() as (typeof SETTINGS_SUBPAGES)[number]);
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
  orgSettingsSubpage: /^\/([a-z0-9-]+)\/settings\/(categories|units|departments|organization|members)$/,
  deptMain: /^\/([a-z0-9-]+)\/([a-z0-9-]+)$/,
  deptPage: /^\/([a-z0-9-]+)\/([a-z0-9-]+)\/(stocks|transfers|products|reports)$/,
  deptSubPage: /^\/([a-z0-9-]+)\/([a-z0-9-]+)\/(stocks|transfers|products)\/([a-z0-9-]+)$/,
} as const;

/**
 * ✅ FIXED: Parse URL and determine route type (supports settings subpages)
 */
export function parseRoute(pathname: string): {
  type: 'public' | 'app' | 'org-main' | 'org-page' | 'org-settings-subpage' | 'dept-main' | 'dept-page' | 'dept-subpage' | 'api' | 'invalid';
  orgSlug?: string;
  deptSlug?: string;
  page?: string;
  subpage?: string;
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
    
    // Check for app routes with sub-paths (e.g., /dashboard/settings/profile)
    if (APP_ROUTES.includes(firstSegment as (typeof APP_ROUTES)[number])) {
      return { type: 'app' };
    }
  }

  if (segments.length === 0) {
    return { type: 'invalid' };
  }

  // 1 segment: /{orgSlug}
  if (segments.length === 1) {
    const slug = segments[0];
    return {
      type: 'org-main',
      orgSlug: slug,
    };
  }

  // 2 segments: /{orgSlug}/{page} or /{orgSlug}/{deptSlug}
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

  // 3 segments: /{orgSlug}/settings/{subpage} or /{orgSlug}/{deptSlug}/{page}
  if (segments.length === 3) {
    const [orgSlug, secondSegment, thirdSegment] = segments;
    
    // ✅ Check for settings subpages: /{orgSlug}/settings/{subpage}
    if (secondSegment === 'settings' && isSettingsSubpage(thirdSegment)) {
      return {
        type: 'org-settings-subpage',
        orgSlug,
        page: 'settings',
        subpage: thirdSegment,
      };
    }
    
    // Check if it's a valid department page: /{orgSlug}/{deptSlug}/{page}
    if (isDeptLevelPage(thirdSegment)) {
      return {
        type: 'dept-page',
        orgSlug,
        deptSlug: secondSegment,
        page: thirdSegment,
      };
    }
    
    return { type: 'invalid' };
  }

  // ✅ 4 segments: /{orgSlug}/{deptSlug}/{page}/{subpage}
  // Example: /siriraj/ipd/transfers/create, /siriraj/ipd/transfers/{transferId}
  if (segments.length === 4) {
    const [orgSlug, deptSlug, page, subpage] = segments;
    
    // Validate page is a department-level page
    if (isDeptLevelPage(page)) {
      return {
        type: 'dept-subpage',
        orgSlug,
        deptSlug,
        page,
        subpage,
      };
    }
    
    return { type: 'invalid' };
  }

  // ✅ 5+ segments are also valid (for nested routes)
  // Example: /siriraj/ipd/transfers/create/step2
  if (segments.length >= 5) {
    const [orgSlug, deptSlug, page, ...rest] = segments;
    
    // Validate page is a department-level page
    if (isDeptLevelPage(page)) {
      return {
        type: 'dept-subpage',
        orgSlug,
        deptSlug,
        page,
        subpage: rest.join('/'), // Join remaining segments
      };
    }
    
    return { type: 'invalid' };
  }

  return { type: 'invalid' };
}

// ===== TYPE EXPORTS =====
export type AppRoute = (typeof APP_ROUTES)[number];
export type OrgLevelPage = (typeof ORG_LEVEL_PAGES)[number];
export type DeptLevelPage = (typeof DEPT_LEVEL_PAGES)[number];
export type SettingsSubpage = (typeof SETTINGS_SUBPAGES)[number];
export type SystemReserved = (typeof SYSTEM_RESERVED)[number];
export type PublicRoute = (typeof PUBLIC_ROUTES)[number];
export type RouteType = ReturnType<typeof parseRoute>['type'];