// FILE: app/api/[orgSlug]/members/[userId]/route.ts
// Members API - Remove member
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { orgSlug: string; userId: string } }
) {
  try {
    const user = getUserFromHeaders(request.headers);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const access = await getUserOrgRole(user.userId, params.orgSlug);
    if (!access) {
      return NextResponse.json({ error: 'No access to organization' }, { status: 403 });
    }

    if (access.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only OWNER can remove members' }, { status: 403 });
    }

    if (params.userId === user.userId) {
      return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 });
    }

    const targetMember = await prisma.organizationMember.findFirst({
      where: { organizationId: access.organizationId, userId: params.userId },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!targetMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (targetMember.role === 'OWNER') {
      return NextResponse.json({ error: 'Cannot remove another OWNER' }, { status: 403 });
    }

    await prisma.organizationMember.delete({
      where: {
        organizationId_userId: {
          organizationId: access.organizationId,
          userId: params.userId,
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: access.organizationId,
        userId: user.userId,
        action: 'MEMBER_REMOVED',
        entityType: 'ORGANIZATION_MEMBER',
        entityId: targetMember.id,
        metadata: {
          removedUserId: params.userId,
          removedUserName: `${targetMember.user.firstName} ${targetMember.user.lastName}`,
          removedUserEmail: targetMember.user.email,
          previousRole: targetMember.role,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    console.error('Remove member failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}