// FILE: app/api/[orgSlug]/members/route.ts
// Members API - Get all organization members
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  try {
    const { orgSlug } = await params;
    
    // Check authentication
    const user = getUserFromHeaders(request.headers);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check organization access
    const access = await getUserOrgRole(user.userId, orgSlug);
    if (!access) {
      return NextResponse.json(
        { error: 'No access to organization' },
        { status: 403 }
      );
    }

    // Check permission to view members
    if (!['ADMIN', 'OWNER'].includes(access.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // ✅ FIXED: Get all members using organizationUser
    const members = await prisma.organizationUser.findMany({
      where: {
        organizationId: access.organizationId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            username: true,
          },
        },
      },
      orderBy: [
        { roles: 'desc' },
        { joinedAt: 'asc' },
      ],
    });

    // ✅ FIXED: Map response with correct field names
    return NextResponse.json({
      success: true,
      members: members.map((member: any) => ({
        id: member.id,
        userId: member.userId,
        role: member.roles, // ✅ Map 'roles' to 'role'
        joinedAt: member.joinedAt,
        user: member.user,
      })),
    });
  } catch (error) {
    console.error('Get members failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}