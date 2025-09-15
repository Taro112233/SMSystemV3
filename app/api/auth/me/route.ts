// app/api/auth/me/route.ts - FIXED FOR CURRENT SCHEMA
import { NextRequest, NextResponse } from 'next/server';
import { getServerUser, getUserFromHeaders } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    let user = await getServerUser();
    
    if (!user) {
      const userInfo = getUserFromHeaders(request.headers);
      if (!userInfo) {
        return NextResponse.json({ success: false, error: 'Not authenticated', data: null }, { status: 401 });
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
        return NextResponse.json({ success: false, error: 'User account not active', data: null }, { status: 403 });
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
      return NextResponse.json({ success: false, error: 'Authentication failed', data: null }, { status: 401 });
    }

    // ✅ FIXED: Remove fields that don't exist in current schema
    const userOrganizations = await prisma.organizationUser.findMany({
      where: { userId: user.userId, isActive: true },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            status: true,
            timezone: true,
            email: true,           // ✅ These exist in current schema
            phone: true,           // ✅ These exist in current schema
            allowDepartments: true // ✅ These exist in current schema
          }
        }
      },
      orderBy: { joinedAt: 'asc' }
    });

    let currentOrganization = null, userRole = null;
    
    if (userOrganizations.length > 0) {
      const firstOrg = userOrganizations[0];
      currentOrganization = firstOrg.organization;
      
      // Use simple role from OrganizationUser
      userRole = firstOrg.roles; // This is 'MEMBER' | 'ADMIN' | 'OWNER'
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true, username: true, email: true, firstName: true, lastName: true,
        phone: true, status: true, isActive: true, emailVerified: true,
        lastLogin: true, createdAt: true, updatedAt: true,
      }
    });

    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'User not found', data: null }, { status: 404 });
    }

    const userResponse = {
      id: dbUser.id, username: dbUser.username, email: dbUser.email,
      firstName: dbUser.firstName, lastName: dbUser.lastName,
      fullName: `${dbUser.firstName} ${dbUser.lastName}`,
      phone: dbUser.phone, status: dbUser.status, isActive: dbUser.isActive,
      emailVerified: dbUser.emailVerified, lastLogin: dbUser.lastLogin,
      createdAt: dbUser.createdAt, updatedAt: dbUser.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: { user: userResponse, organizations: userOrganizations, currentOrganization, currentRole: userRole }
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error', data: null }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ success: false, error: 'Method not allowed. Use GET to fetch user info.' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ success: false, error: 'Method not allowed. Use GET to fetch user info.' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ success: false, error: 'Method not allowed. Use GET to fetch user info.' }, { status: 405 });
}