// FILE: app/api/[orgSlug]/members/[userId]/route.ts
// Members API - Remove member
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; userId: string }> }
) {
  try {
    const { orgSlug, userId } = await params;
    
    const user = getUserFromHeaders(request.headers);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const access = await getUserOrgRole(user.userId, orgSlug);
    if (!access) {
      return NextResponse.json({ error: 'No access to organization' }, { status: 403 });
    }

    if (access.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only OWNER can remove members' }, { status: 403 });
    }

    if (userId === user.userId) {
      return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 });
    }

    // ✅ FIXED: Use organizationUser instead of organizationMember
    const targetMember = await prisma.organizationUser.findFirst({
      where: { organizationId: access.organizationId, userId },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!targetMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (targetMember.roles === 'OWNER') {
      return NextResponse.json({ error: 'Cannot remove another OWNER' }, { status: 403 });
    }

    // ✅ FIXED: Delete organizationUser
    await prisma.organizationUser.delete({
      where: {
        organizationId_userId: {
          organizationId: access.organizationId,
          userId,
        },
      },
    });

    // ✅ FIXED: Create audit log without entityType
    await prisma.auditLog.create({
      data: {
        organizationId: access.organizationId,
        userId: user.userId,
        action: 'members.removed',
        resourceId: targetMember.id,
        payload: {
          removedUserId: userId,
          removedUserName: `${targetMember.user.firstName} ${targetMember.user.lastName}`,
          removedUserEmail: targetMember.user.email,
          previousRole: targetMember.roles,
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