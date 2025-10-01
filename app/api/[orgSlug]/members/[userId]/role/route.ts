// FILE: app/api/[orgSlug]/members/[userId]/role/route.ts
// Members API - Update member role
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
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

    const body = await request.json();
    const { role } = body;

    if (!['MEMBER', 'ADMIN', 'OWNER'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Permission checks
    if (access.role === 'OWNER') {
      if (userId === user.userId && role !== 'OWNER') {
        return NextResponse.json({ error: 'Cannot change your own OWNER role' }, { status: 403 });
      }
    } else if (access.role === 'ADMIN') {
      if (role === 'OWNER') {
        return NextResponse.json({ error: 'Only OWNER can assign OWNER role' }, { status: 403 });
      }

      // ✅ FIXED: Use organizationUser instead of organizationMember
      const targetMember = await prisma.organizationUser.findFirst({
        where: { organizationId: access.organizationId, userId },
      });

      if (targetMember?.roles === 'OWNER') {
        return NextResponse.json({ error: 'Cannot change OWNER role' }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // ✅ FIXED: Update organizationUser instead of organizationMember
    const updatedMember = await prisma.organizationUser.update({
      where: {
        organizationId_userId: {
          organizationId: access.organizationId,
          userId,
        },
      },
      data: { roles: role },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    // ✅ FIXED: Create audit log without entityType
    await prisma.auditLog.create({
      data: {
        organizationId: access.organizationId,
        userId: user.userId,
        action: 'members.role_updated',
        resourceId: updatedMember.id,
        payload: {
          targetUserId: userId,
          newRole: role,
          targetUserName: `${updatedMember.user.firstName} ${updatedMember.user.lastName}`,
        },
      },
    });

    return NextResponse.json({
      success: true,
      member: updatedMember,
      message: 'Member role updated successfully',
    });
  } catch (error) {
    console.error('Update member role failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}