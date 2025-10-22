// FILE: app/api/auth/me/route.ts
// UPDATED: Return color and icon for currentOrganization
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import type { JWTUser } from '@/lib/auth';

interface CompleteUserData {
  user: {
    id: string;
    username: string;
    email: string | null;
    firstName: string;
    lastName: string;
    fullName: string;
    phone: string | null;
    status: string;
    isActive: boolean;
    emailVerified: boolean;
    lastLogin: Date | null;
    avatar: string;
    createdAt: Date;
    updatedAt: Date;
  };
  currentOrganization: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    status: string;
    timezone: string;
    color: string | null;        // ✅ CRITICAL: Add color
    icon: string | null;         // ✅ CRITICAL: Add icon
    userRole: string;            // ✅ CRITICAL: Add userRole
    memberCount: number;
    departmentCount: number;
    inviteCode?: string | null;
    inviteEnabled?: boolean;
  } | null;
  organizations: Array<{
    id: string;
    organizationId: string;
    role: string;
    isOwner: boolean;
    joinedAt: Date;
    organization: {
      id: string;
      name: string;
      slug: string;
      color: string | null;      // ✅ CRITICAL: Add color
      icon: string | null;       // ✅ CRITICAL: Add icon
      memberCount: number;
      departmentCount: number;
    };
  }>;
  permissions: {
    currentRole: string | null;
    canManageOrganization: boolean;
    canManageDepartments: boolean;
    canCreateProducts: boolean;
    canGenerateJoinCode: boolean;
    organizationPermissions: string[];
  };
  session: {
    isTokenExpiringSoon: boolean;
    timezone: string;
    language: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const user: JWTUser | null = await getServerUser();
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED' 
      }, { status: 401 });
    }

    const url = new URL(request.url);
    const orgSlug = url.searchParams.get('orgSlug') || 
                    request.headers.get('x-current-org');

    // ✅ UPDATED: Select color and icon from organization
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true, username: true, email: true, 
        firstName: true, lastName: true, phone: true,
        status: true, isActive: true, emailVerified: true,
        lastLogin: true, createdAt: true, updatedAt: true,
        organizationUsers: {
          where: { isActive: true },
          select: {
            id: true, organizationId: true, roles: true, 
            isOwner: true, joinedAt: true,
            organization: {
              select: {
                id: true, name: true, slug: true, description: true,
                status: true, timezone: true, 
                color: true,         // ✅ CRITICAL: Select color
                icon: true,          // ✅ CRITICAL: Select icon
                inviteCode: true, inviteEnabled: true,
                _count: {
                  select: {
                    users: { where: { isActive: true } },
                    departments: { where: { isActive: true } }
                  }
                }
              }
            }
          },
          orderBy: { joinedAt: 'desc' }
        }
      }
    });

    if (!userData || !userData.isActive || userData.status !== 'ACTIVE') {
      return NextResponse.json({ 
        success: false, 
        error: 'User account not active',
        code: 'ACCOUNT_INACTIVE' 
      }, { status: 403 });
    }

    const userOrganizations = userData.organizationUsers;
    let currentOrganization = null;
    let currentRole: string | null = null;

    if (userOrganizations.length > 0) {
      let targetOrgUser = null;
      
      if (orgSlug) {
        targetOrgUser = userOrganizations.find(org => 
          org.organization.slug === orgSlug
        );
      }
      
      if (!targetOrgUser) {
        targetOrgUser = userOrganizations[0];
      }

      if (targetOrgUser) {
        const orgData = targetOrgUser.organization;
        currentRole = targetOrgUser.roles as string;
        
        // ✅ CRITICAL: Include color and icon in response
        currentOrganization = {
          id: orgData.id,
          name: orgData.name,
          slug: orgData.slug,
          description: orgData.description,
          status: orgData.status,
          timezone: orgData.timezone,
          color: orgData.color,              // ✅ CRITICAL: Return color
          icon: orgData.icon,                // ✅ CRITICAL: Return icon
          userRole: currentRole,             // ✅ CRITICAL: Return userRole
          memberCount: orgData._count.users,
          departmentCount: orgData._count.departments,
          ...((['ADMIN', 'OWNER'].includes(currentRole)) && {
            inviteCode: orgData.inviteCode,
            inviteEnabled: orgData.inviteEnabled,
          })
        };
      }
    }

    const permissions = {
      currentRole,
      canManageOrganization: currentRole === 'OWNER',
      canManageDepartments: ['ADMIN', 'OWNER'].includes(currentRole || ''),
      canCreateProducts: ['ADMIN', 'OWNER'].includes(currentRole || ''),
      canGenerateJoinCode: ['ADMIN', 'OWNER'].includes(currentRole || ''),
      organizationPermissions: getPermissionsByRole(currentRole)
    };

    // ✅ CRITICAL: Include color and icon in organizations list
    const organizationsList = userOrganizations.map(orgUser => ({
      id: orgUser.id,
      organizationId: orgUser.organizationId,
      role: orgUser.roles as string,
      isOwner: orgUser.isOwner,
      joinedAt: orgUser.joinedAt,
      organization: {
        id: orgUser.organization.id,
        name: orgUser.organization.name,
        slug: orgUser.organization.slug,
        color: orgUser.organization.color,              // ✅ CRITICAL: Return color
        icon: orgUser.organization.icon,                // ✅ CRITICAL: Return icon
        memberCount: orgUser.organization._count.users,
        departmentCount: orgUser.organization._count.departments,
      }
    }));

    const response: CompleteUserData = {
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        fullName: `${userData.firstName} ${userData.lastName}`,
        phone: userData.phone,
        status: userData.status,
        isActive: userData.isActive,
        emailVerified: userData.emailVerified,
        lastLogin: userData.lastLogin,
        avatar: generateAvatarUrl(userData.firstName, userData.lastName),
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      },
      currentOrganization,
      organizations: organizationsList,
      permissions,
      session: {
        isTokenExpiringSoon: checkTokenExpiry(user),
        timezone: currentOrganization?.timezone || 'Asia/Bangkok',
        language: 'th',
      },
    };

    // ✅ DEBUG: Log to verify color, icon, and userRole are included
    console.log('✅ /api/auth/me - Response includes color, icon & userRole:', {
      orgName: currentOrganization?.name,
      color: currentOrganization?.color,
      icon: currentOrganization?.icon,
      userRole: currentOrganization?.userRole
    });

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Get user data error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

function getPermissionsByRole(role: string | null): string[] {
  if (!role) return [];
  
  const rolePermissions: Record<string, string[]> = {
    OWNER: [
      'organizations.manage', 'organizations.settings',
      'departments.create', 'departments.update', 'departments.delete',
      'products.create', 'products.update', 'products.delete',
      'stocks.read', 'stocks.adjust',
      'transfers.create', 'transfers.approve',
      'join_code.generate', 'join_code.disable',
      'users.manage', 'reports.view', 'audit.view'
    ],
    ADMIN: [
      'departments.read', 'departments.create', 'departments.update',
      'products.create', 'products.update', 'products.delete',
      'stocks.read', 'stocks.adjust',
      'transfers.create', 'transfers.approve',
      'join_code.generate',
      'reports.view'
    ],
    MEMBER: [
      'departments.read', 'products.read',
      'stocks.read', 'stocks.adjust',
      'transfers.create', 'transfers.receive'
    ]
  };

  return rolePermissions[role] || [];
}

function generateAvatarUrl(firstName: string, lastName: string): string {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  return `https://ui-avatars.com/api/?name=${initials}&background=3B82F6&color=ffffff&size=128&rounded=true`;
}

function checkTokenExpiry(user: JWTUser): boolean {
  if (user.exp) {
    const now = Math.floor(Date.now() / 1000);
    const timeToExpiry = user.exp - now;
    return timeToExpiry < 24 * 60 * 60;
  }
  return false;
}