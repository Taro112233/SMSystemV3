// FILE: app/api/[orgSlug]/members/route.ts
// Members API - UPDATED: Allow all org members to view
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

interface OrganizationUserWithUser {
  id: string;
  organizationId: string;
  userId: string;
  roles: string;
  isOwner: boolean;
  joinedAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    username: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  try {
    const { orgSlug } = await params;
    
    const user = getUserFromHeaders(request.headers);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const access = await getUserOrgRole(user.userId, orgSlug);
    if (!access) {
      return NextResponse.json(
        { error: 'No access to organization' },
        { status: 403 }
      );
    }

    // ✅ UPDATED: Allow all org members to view member list
    // (Previously required ADMIN/OWNER, now any member can view)

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
    }) as OrganizationUserWithUser[];

    return NextResponse.json({
      success: true,
      members: members.map((member) => ({
        id: member.id,
        userId: member.userId,
        role: member.roles,
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