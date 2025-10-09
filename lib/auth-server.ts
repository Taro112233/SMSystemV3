// lib/auth-server.ts - FIXED: Handle null email/phone in headers
// InvenStock - Server-side User Verification Utilities (Next.js 15 Compatible)

import { cookies } from 'next/headers';
import { verifyToken, JWTUser } from './auth';
import { prisma } from './prisma';

type OrganizationRole = 'MEMBER' | 'ADMIN' | 'OWNER';

/**
 * ✅ Get current user from server-side (JWT only - no org context)
 */
export async function getServerUser(): Promise<JWTUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);

    if (!payload || !payload.userId) {
      return null;
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        status: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive || user.status !== 'ACTIVE') {
      return null;
    }

    return {
      userId: user.id,
      email: user.email || '',
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  } catch (error) {
    console.error('Server user verification failed:', error);
    return null;
  }
}

/**
 * ✅ FIXED: Get user from request headers (handle null values)
 */
export function getUserFromHeaders(headers: Headers): {
  userId: string;
  email: string;
  username: string;
} | null {
  const userId = headers.get('x-user-id');
  const email = headers.get('x-user-email');
  const username = headers.get('x-username');

  // ✅ CRITICAL FIX: Only userId and username are required
  // email can be empty string (converted from null)
  if (!userId || !username) {
    console.log('❌ Missing required headers:', { userId: !!userId, username: !!username });
    return null;
  }

  return { 
    userId, 
    email: email || '',  // ✅ Default to empty string if null
    username 
  };
}

/**
 * ✅ Check user's role in specific organization (real-time database check)
 */
export async function getUserOrgRole(
  userId: string, 
  orgSlug: string
): Promise<{ role: OrganizationRole; organizationId: string } | null> {
  try {
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        userId,
        isActive: true,
        organization: {
          slug: orgSlug,
          status: 'ACTIVE'
        }
      },
      include: {
        organization: {
          select: { id: true }
        }
      }
    });

    if (!orgUser) return null;

    return {
      role: orgUser.roles as OrganizationRole,
      organizationId: orgUser.organization.id
    };
  } catch (error) {
    console.error('Failed to get user org role:', error);
    return null;
  }
}

/**
 * ✅ Validate user has access to organization (for middleware use)
 */
export async function validateOrgAccess(
  userId: string,
  orgSlug: string
): Promise<boolean> {
  try {
    const access = await getUserOrgRole(userId, orgSlug);
    return access !== null;
  } catch (error) {
    console.error('Organization access validation failed:', error);
    return false;
  }
}

/**
 * ✅ Check if user has specific permission in organization
 */
export async function hasOrgPermission(
  userId: string,
  orgSlug: string,
  permission: string
): Promise<boolean> {
  try {
    const access = await getUserOrgRole(userId, orgSlug);
    if (!access) return false;

    const userRole = access.role;

    // Simple role-based permission checking
    switch (permission) {
      // MEMBER permissions - all org members
      case 'stocks.read':
      case 'stocks.adjust':
      case 'products.read':
      case 'departments.read':
      case 'transfers.create':
      case 'transfers.receive':
        return ['MEMBER', 'ADMIN', 'OWNER'].includes(userRole);
      
      // ADMIN permissions
      case 'products.create':
      case 'products.update':
      case 'products.delete':
      case 'categories.create':
      case 'departments.create':
      case 'departments.update':
      case 'users.invite':
      case 'transfers.approve':
      case 'join_code.generate':
        return ['ADMIN', 'OWNER'].includes(userRole);
      
      // OWNER permissions
      case 'departments.delete':
      case 'organization.settings':
      case 'users.manage':
        return userRole === 'OWNER';
      
      default:
        return false;
    }
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
}

/**
 * ✅ Require specific permission (throws if not authorized)
 */
export async function requireOrgPermission(
  userId: string,
  orgSlug: string,
  permission: string
): Promise<{ role: OrganizationRole; organizationId: string }> {
  const access = await getUserOrgRole(userId, orgSlug);
  
  if (!access) {
    throw new Error(`No access to organization: ${orgSlug}`);
  }

  const hasAccess = await hasOrgPermission(userId, orgSlug, permission);
  
  if (!hasAccess) {
    throw new Error(`Permission denied: ${permission}`);
  }

  return access;
}

/**
 * ✅ Check if user has minimum role in organization
 */
export async function hasMinimumOrgRole(
  userId: string,
  orgSlug: string,
  minimumRole: OrganizationRole
): Promise<boolean> {
  try {
    const access = await getUserOrgRole(userId, orgSlug);
    if (!access) return false;

    const roleHierarchy = {
      MEMBER: 1,
      ADMIN: 2,
      OWNER: 3
    };

    return roleHierarchy[access.role] >= roleHierarchy[minimumRole];
  } catch (error) {
    console.error('Role check failed:', error);
    return false;
  }
}

/**
 * ✅ Get organization data by slug
 */
export async function getOrganizationBySlug(orgSlug: string) {
  try {
    return await prisma.organization.findUnique({
      where: { 
        slug: orgSlug,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        status: true,
        timezone: true,
        email: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    console.error('Failed to get organization:', error);
    return null;
  }
}

/**
 * ✅ Get user's organizations list
 */
export async function getUserOrganizations(userId: string) {
  try {
    const organizationUsers = await prisma.organizationUser.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            status: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });

    return organizationUsers.map(orgUser => ({
      ...orgUser.organization,
      role: orgUser.roles,
      isOwner: orgUser.isOwner,
      joinedAt: orgUser.joinedAt
    }));
  } catch (error) {
    console.error('Failed to get user organizations:', error);
    return [];
  }
}

/**
 * ✅ API route helper - extract org context and validate access
 */
export async function withOrgContext(
  request: Request,
  handler: (userId: string, orgId: string, role: OrganizationRole) => Promise<Response>
) {
  try {
    // Get user from headers
    const user = getUserFromHeaders(new Headers(request.headers));
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get org slug from headers
    const orgSlug = new Headers(request.headers).get('x-current-org');
    if (!orgSlug) {
      return new Response(
        JSON.stringify({ error: 'Organization context required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate access and get role
    const access = await getUserOrgRole(user.userId, orgSlug);
    if (!access) {
      return new Response(
        JSON.stringify({ error: 'No access to organization' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return await handler(user.userId, access.organizationId, access.role);

  } catch (error) {
    console.error('Organization context error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}