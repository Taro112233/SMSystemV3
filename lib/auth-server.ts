// lib/auth-server.ts - SIMPLIFIED 3-ROLE SYSTEM (FIXED TYPESCRIPT ERRORS)
// InvenStock - Server-side User Verification Utilities (Next.js 15 Compatible)

import { cookies } from 'next/headers';
import { verifyToken, JWTUser } from './auth';
import { prisma } from './prisma';
import { ColorTheme, IconType } from '@prisma/client';

type OrganizationRole = 'MEMBER' | 'ADMIN' | 'OWNER';

// Define proper types for organization data (matching simplified schema)
interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  status: string;
  timezone: string;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
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
  const targetOrgId = organizationId || user.organizationId;

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
      role: orgUser.roles as OrganizationRole,
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
      // MEMBER permissions - ทุกคนในองค์กรทำได้
      case 'stocks.read':
      case 'stocks.adjust':
      case 'products.read':
      case 'departments.read':     // ✅ ทุกคนเห็นทุกแผนก
      case 'transfers.create':
      case 'transfers.receive':
        return ['MEMBER', 'ADMIN', 'OWNER'].includes(userRole);
      
      // ADMIN permissions
      case 'products.create':
      case 'products.update':
      case 'products.delete':
      case 'categories.create':
      case 'departments.create':   // ✅ สร้างแผนกได้
      case 'departments.update':   // ✅ แก้ไขแผนกได้
      case 'users.invite':
      case 'transfers.approve':
        return ['ADMIN', 'OWNER'].includes(userRole);
      
      // OWNER permissions
      case 'departments.delete':   // ✅ ลบแผนกได้เฉพาะ OWNER
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

// ===== FIXED DEPARTMENT FUNCTIONS =====

/**
 * Get all departments in organization (no access control)
 * ✅ All users can see all departments
 */
export async function getDepartments(organizationId: string) {
  try {
    return await prisma.department.findMany({
      where: { 
        organizationId,
        isActive: true
      },
      orderBy: { name: 'asc' },
      include: {
        parent: true,
        children: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Failed to get departments:', error);
    return [];
  }
}

/**
 * Get single department (no access control)
 */
export async function getDepartment(organizationId: string, departmentId: string) {
  try {
    return await prisma.department.findFirst({
      where: {
        id: departmentId,
        organizationId,
        isActive: true
      },
      include: {
        parent: true,
        children: true,
        organization: true
      }
    });
  } catch (error) {
    console.error('Failed to get department:', error);
    return null;
  }
}

/**
 * Create department (requires ADMIN+ role) - FIXED TYPES
 */
export async function createDepartment(
  organizationId: string, 
  userId: string, 
  data: {
    name: string;
    code: string;
    description?: string;
    color?: ColorTheme;      // ✅ Fixed: proper enum type
    icon?: IconType;         // ✅ Fixed: proper enum type
    parentId?: string;
  }
) {
  // Check permission
  await requirePermission('departments.create', organizationId, userId);
  
  try {
    return await prisma.department.create({
      data: {
        organizationId,
        createdBy: userId,
        isActive: true,
        name: data.name,
        code: data.code,
        description: data.description || null,
        color: data.color || null,          // ✅ Fixed: explicit null handling
        icon: data.icon || null,            // ✅ Fixed: explicit null handling
        parentId: data.parentId || null,    // ✅ Fixed: explicit null handling
      },
      include: {
        organization: true,
        parent: true
      }
    });
  } catch (error) {
    console.error('Failed to create department:', error);
    throw new Error('Failed to create department');
  }
}

/**
 * Update department (requires ADMIN+ role) - FIXED TYPES
 */
export async function updateDepartment(
  organizationId: string,
  userId: string,
  departmentId: string,
  data: {
    name?: string;
    code?: string;
    description?: string;
    color?: ColorTheme;        // ✅ Fixed: proper enum type  
    icon?: IconType;           // ✅ Fixed: proper enum type
    parentId?: string | null;  // ✅ Fixed: allow explicit null
    isActive?: boolean;
  }
) {
  // Check permission
  await requirePermission('departments.update', organizationId, userId);
  
  try {
    // ✅ Fixed: Build update data with proper types
    const updateData: any = {
      updatedBy: userId,
      updatedAt: new Date()
    };

    // Only include fields that are provided
    if (data.name !== undefined) updateData.name = data.name;
    if (data.code !== undefined) updateData.code = data.code;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    
    // ✅ Fixed: Handle parentId properly for hierarchical updates
    if (data.parentId !== undefined) {
      updateData.parentId = data.parentId;
    }

    return await prisma.department.update({
      where: {
        id: departmentId,
        organizationId
      },
      data: updateData,
      include: {
        organization: true,
        parent: true,
        children: true
      }
    });
  } catch (error) {
    console.error('Failed to update department:', error);
    throw new Error('Failed to update department');
  }
}

/**
 * Delete department (requires OWNER role)
 */
export async function deleteDepartment(
  organizationId: string,
  userId: string,
  departmentId: string
) {
  // Check permission - only OWNER can delete departments
  await requirePermission('departments.delete', organizationId, userId);
  
  try {
    // Soft delete - set isActive to false
    return await prisma.department.update({
      where: {
        id: departmentId,
        organizationId
      },
      data: {
        isActive: false,
        updatedBy: userId,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Failed to delete department:', error);
    throw new Error('Failed to delete department');
  }
}