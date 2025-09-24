// app/api/auth/me/route.ts - CLEANED VERSION (NO INVITATION SYSTEM)
import { NextRequest, NextResponse } from 'next/server';
import { getServerUser, getUserFromHeaders } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import type { JWTUser } from '@/lib/auth';

// ===== RESPONSE INTERFACE (NO INVITATION) =====
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
    memberCount: number;
    departmentCount: number;
    inviteCode?: string | null;       // Only for ADMIN/OWNER
    inviteEnabled?: boolean;          // Only for ADMIN/OWNER
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
      memberCount: number;
      departmentCount: number;
    };
  }>;
  permissions: {
    currentRole: string | null;
    canManageOrganization: boolean;
    canManageDepartments: boolean;
    canCreateProducts: boolean;
    canGenerateJoinCode: boolean;     // ✅ Join code permission (instead of invite)
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
    // ===== AUTHENTICATION CHECK =====
    let user: JWTUser | null = await getServerUser();
    
    if (!user) {
      const userInfo = getUserFromHeaders(request.headers);
      if (!userInfo) {
        return NextResponse.json({ 
          success: false, 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED' 
        }, { status: 401 });
      }
      
      const dbUser = await prisma.user.findUnique({
        where: { id: userInfo.userId },
        select: {
          id: true, username: true, email: true, firstName: true, lastName: true,
          phone: true, status: true, isActive: true, emailVerified: true,
          lastLogin: true, createdAt: true, updatedAt: true,
        }
      });

      if (!dbUser || !dbUser.isActive || dbUser.status !== 'ACTIVE') {
        return NextResponse.json({ 
          success: false, 
          error: 'User account not active',
          code: 'ACCOUNT_INACTIVE' 
        }, { status: 403 });
      }

      user = {
        userId: dbUser.id, 
        email: dbUser.email || '',
        username: dbUser.username || undefined,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
      };
    }

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication failed',
        code: 'AUTH_FAILED' 
      }, { status: 401 });
    }

    // ===== SINGLE OPTIMIZED QUERY (NO INVITATION FIELDS) =====
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
                status: true, timezone: true, inviteCode: true, inviteEnabled: true,
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

    // ===== DETERMINE CURRENT ORGANIZATION =====
    const userOrganizations = userData.organizationUsers;
    let currentOrganization = null;
    let currentRole: string | null = null;

    if (userOrganizations.length > 0) {
      const contextOrgId = user.organizationId;
      const targetOrgUser = contextOrgId 
        ? userOrganizations.find(org => org.organizationId === contextOrgId)
        : userOrganizations[0];

      if (targetOrgUser) {
        const orgData = targetOrgUser.organization;
        currentRole = targetOrgUser.roles as string;
        
        currentOrganization = {
          id: orgData.id,
          name: orgData.name,
          slug: orgData.slug,
          description: orgData.description,
          status: orgData.status,
          timezone: orgData.timezone,
          memberCount: orgData._count.users,
          departmentCount: orgData._count.departments,
          // ✅ ONLY show join code info for ADMIN/OWNER (no invitation fields)
          ...((['ADMIN', 'OWNER'].includes(currentRole)) && {
            inviteCode: orgData.inviteCode,
            inviteEnabled: orgData.inviteEnabled,
          })
        };
      }
    }

    // ===== CALCULATE PERMISSIONS (NO INVITATION PERMISSIONS) =====
    const permissions = {
      currentRole,
      canManageOrganization: currentRole === 'OWNER',
      canManageDepartments: ['ADMIN', 'OWNER'].includes(currentRole || ''),
      canCreateProducts: ['ADMIN', 'OWNER'].includes(currentRole || ''),
      canGenerateJoinCode: ['ADMIN', 'OWNER'].includes(currentRole || ''), // ✅ Join code permission
      organizationPermissions: getPermissionsByRole(currentRole)
    };

    // ===== PREPARE ORGANIZATIONS LIST =====
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
        memberCount: orgUser.organization._count.users,
        departmentCount: orgUser.organization._count.departments,
      }
    }));

    // ===== BUILD RESPONSE =====
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

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Get user data error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

// ===== HELPER FUNCTIONS (CLEANED - NO INVITATION PERMISSIONS) =====

function getPermissionsByRole(role: string | null): string[] {
  if (!role) return [];
  
  const rolePermissions: Record<string, string[]> = {
    OWNER: [
      'organizations.manage', 'organizations.settings',
      'departments.create', 'departments.update', 'departments.delete',
      'products.create', 'products.update', 'products.delete',
      'stocks.read', 'stocks.adjust',
      'transfers.create', 'transfers.approve',
      'join_code.generate', 'join_code.disable',  // ✅ Join code permissions
      'users.manage', 'reports.view', 'audit.view'
    ],
    ADMIN: [
      'departments.read', 'departments.create', 'departments.update',
      'products.create', 'products.update', 'products.delete',
      'stocks.read', 'stocks.adjust',
      'transfers.create', 'transfers.approve',
      'join_code.generate',                       // ✅ Can generate join codes
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
  // Check if JWT token expires within 24 hours
  if (user.exp) {
    const now = Math.floor(Date.now() / 1000);
    const timeToExpiry = user.exp - now;
    return timeToExpiry < 24 * 60 * 60; // < 24 hours
  }
  return false;
}

// ===== HTTP METHOD RESTRICTIONS =====
export async function POST() {
  return NextResponse.json({ 
    success: false, 
    error: 'Method not allowed. Use GET to fetch user info.' 
  }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ 
    success: false, 
    error: 'Method not allowed. Use GET to fetch user info.' 
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ 
    success: false, 
    error: 'Method not allowed. Use GET to fetch user info.' 
  }, { status: 405 });
}