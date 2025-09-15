// lib/auth-server.ts - SIMPLIFIED 3-ROLE SYSTEM (FIXED TYPESCRIPT ERRORS)
// InvenStock - Server-side User Verification Utilities (Next.js 15 Compatible)

import { cookies } from 'next/headers';
import { verifyToken, JWTUser } from './auth';
import { prisma } from './prisma';

type OrganizationRole = 'MEMBER' | 'ADMIN' | 'OWNER';

// Define proper types for organization data (matching actual schema)
interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  status: string;
  timezone: string;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  allowDepartments: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Get current user from server-side (for API routes and server components)
 */
export async function getServerUser(): Promise<JWTUser | null> {
  try {
    // Get token from cookies (Next.js 15 - cookies() is now async)
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    // Verify JWT token
    const payload = await verifyToken(token);

    if (!payload || !payload.userId) {
      return null;
    }

    // Verify user still exists and is active in database
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
      username: user.username || undefined,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  } catch (error) {
    console.error('Server user verification failed:', error);
    return null;
  }
}

/**
 * Get user ID from server-side (quick version)
 */
export async function getServerUserId(): Promise<string | null> {
  const user = await getServerUser();
  return user?.userId || null;
}

/**
 * Check if user is authenticated on server-side
 */
export async function isServerAuthenticated(): Promise<boolean> {
  const user = await getServerUser();
  return user !== null;
}

/**
 * Get user from request headers (for API routes with middleware)
 */
export function getUserFromHeaders(headers: Headers): {
  userId: string;
  email: string;
  role?: OrganizationRole;
} | null {
  const userId = headers.get('x-user-id');
  const email = headers.get('x-user-email');
  const role = headers.get('x-role') as OrganizationRole;

  if (!userId || !email) {
    return null;
  }

  return { userId, email, role };
}

/**
 * Require authentication on server-side (throws if not authenticated)
 */
export async function requireServerAuth(): Promise<JWTUser> {
  const user = await getServerUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

/**
 * Get user with organization context - SIMPLIFIED
 */
export async function getServerUserWithOrganization(organizationId?: string): Promise<{
  user: JWTUser;
  organization: OrganizationData | null;
  role: OrganizationRole | null;
} | null> {
  const user = await getServerUser();
  
  if (!user) {
    return null;
  }

  // If no organizationId provided, try to get from JWT
  const targetOrgId = organizationId || user.organizationId; // Fixed: use const

  if (!targetOrgId) {
    return { user, organization: null, role: null };
  }

  try {
    // Get user's organization membership with simple role
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        userId: user.userId,
        organizationId: targetOrgId,
        isActive: true,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            timezone: true,
            description: true,
            email: true,
            phone: true,
            allowDepartments: true,
          },
        },
      },
    });

    if (!orgUser || !orgUser.organization) {
      return null;
    }

    return {
      user,
      organization: orgUser.organization as OrganizationData,
      role: orgUser.roles as OrganizationRole, // Simple role from OrganizationUser
    };
  } catch (error) {
    console.error('Failed to get user organization context:', error);
    return { user, organization: null, role: null };
  }
}

/**
 * Get user's role in organization - SIMPLIFIED
 */
export async function getUserRole(
  userId: string, 
  organizationId: string
): Promise<OrganizationRole | null> {
  try {
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        userId,
        organizationId,
        isActive: true,
      },
    });

    return orgUser?.roles as OrganizationRole || null;
  } catch (error) {
    console.error('Failed to get user role:', error);
    return null;
  }
}

/**
 * Check if user has permission - SIMPLIFIED 3-ROLE SYSTEM
 */
export async function hasPermission(
  permission: string,
  organizationId?: string,
  userId?: string
): Promise<boolean> {
  try {
    const user = userId ? { userId } : await getServerUser();
    if (!user) return false;

    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        userId: user.userId,
        organizationId,
        isActive: true,
      },
    });

    if (!orgUser) return false;

    const userRole = orgUser.roles as OrganizationRole;

    // Simple role-based permission checking
    switch (permission) {
      // MEMBER permissions
      case 'stocks.read':
      case 'stocks.adjust':
      case 'products.read':
      case 'transfers.create':
      case 'transfers.receive':
        return ['MEMBER', 'ADMIN', 'OWNER'].includes(userRole);
      
      // ADMIN permissions
      case 'products.create':
      case 'products.update':
      case 'products.delete':
      case 'categories.create':
      case 'users.invite':
      case 'transfers.approve':
        return ['ADMIN', 'OWNER'].includes(userRole);
      
      // OWNER permissions
      case 'departments.create':
      case 'departments.update':
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
 * Require specific permission (throws if not authorized)
 */
export async function requirePermission(
  permission: string,
  organizationId?: string,
  userId?: string
): Promise<void> {
  const hasAccess = await hasPermission(permission, organizationId, userId);
  
  if (!hasAccess) {
    throw new Error(`Permission denied: ${permission}`);
  }
}

/**
 * Check if user has minimum role - SIMPLIFIED
 */
export async function hasMinimumRole(
  minimumRole: OrganizationRole,
  organizationId: string,
  userId?: string
): Promise<boolean> {
  try {
    const user = userId ? { userId } : await getServerUser();
    if (!user) return false;

    const userRole = await getUserRole(user.userId, organizationId);
    if (!userRole) return false;

    const roleHierarchy = {
      MEMBER: 1,
      ADMIN: 2,
      OWNER: 3
    };

    return roleHierarchy[userRole] >= roleHierarchy[minimumRole];
  } catch (error) {
    console.error('Role check failed:', error);
    return false;
  }
}

/**
 * Require minimum role (throws if not authorized)
 */
export async function requireMinimumRole(
  minimumRole: OrganizationRole,
  organizationId: string,
  userId?: string
): Promise<void> {
  const hasAccess = await hasMinimumRole(minimumRole, organizationId, userId);
  
  if (!hasAccess) {
    throw new Error(`Insufficient role: requires ${minimumRole} or higher`);
  }
}

/**
 * Get organization from server context
 */
export async function getServerOrganization(organizationId: string): Promise<OrganizationData | null> {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        status: true,
        timezone: true,
        email: true,
        phone: true,
        allowDepartments: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return organization as OrganizationData | null;
  } catch (error) {
    console.error('Failed to get organization:', error);
    return null;
  }
}

/**
 * Validate organization access for user
 */
export async function validateOrganizationAccess(
  userId: string,
  organizationId: string
): Promise<boolean> {
  try {
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        userId,
        organizationId,
        isActive: true,
      },
    });

    return orgUser !== null;
  } catch (error) {
    console.error('Failed to validate organization access:', error);
    return false;
  }
}

/**
 * Get user's organizations
 */
export async function getUserOrganizations(userId: string): Promise<OrganizationData[]> {
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
            allowDepartments: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });

    return organizationUsers.map(orgUser => orgUser.organization) as OrganizationData[];
  } catch (error) {
    console.error('Failed to get user organizations:', error);
    return [];
  }
}

/**
 * Check if user is owner of organization
 */
export async function isOrganizationOwner(
  userId: string,
  organizationId: string
): Promise<boolean> {
  try {
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        userId,
        organizationId,
        isActive: true,
        roles: 'OWNER',
      },
    });

    return orgUser !== null;
  } catch (error) {
    console.error('Failed to check organization ownership:', error);
    return false;
  }
}

/**
 * Check if user is admin or owner of organization
 */
export async function isOrganizationAdminOrOwner(
  userId: string,
  organizationId: string
): Promise<boolean> {
  try {
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        userId,
        organizationId,
        isActive: true,
        roles: {
          in: ['ADMIN', 'OWNER']
        },
      },
    });

    return orgUser !== null;
  } catch (error) {
    console.error('Failed to check admin/owner status:', error);
    return false;
  }
}