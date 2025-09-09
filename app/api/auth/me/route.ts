// app/api/auth/me/route.ts - FIXED FOR 3-ROLE SYSTEM
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
        email: dbUser.email || '', // Fix: Handle null -> string conversion
        username: dbUser.username || undefined, // Fix: Handle null -> undefined conversion
        firstName: dbUser.firstName, 
        lastName: dbUser.lastName,
      };
    }

    // Fix: Add null check for user
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication failed', data: null }, { status: 401 });
    }

    const userOrganizations = await prisma.organizationUser.findMany({
      where: { userId: user.userId, isActive: true },
      include: {
        organization: {
          select: {
            id: true, name: true, slug: true, description: true, logo: true,
            status: true, timezone: true, currency: true, allowDepartments: true,
          }
        }
      },
      orderBy: { joinedAt: 'asc' }
    });

    let currentOrganization = null, userRole = null;
    
    if (userOrganizations.length > 0) {
      const firstOrg = userOrganizations[0];
      currentOrganization = firstOrg.organization;
      
      // Use simple role from OrganizationUser instead of complex role system
      userRole = firstOrg.roles; // This is 'MEMBER' | 'ADMIN' | 'OWNER'
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId }, // Fix: user is now guaranteed to be non-null
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

// Handle other HTTP methods
export async function POST() {
  return NextResponse.json({ success: false, error: 'Method not allowed. Use GET to fetch user info.' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ success: false, error: 'Method not allowed. Use GET to fetch user info.' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ success: false, error: 'Method not allowed. Use GET to fetch user info.' }, { status: 405 });
}