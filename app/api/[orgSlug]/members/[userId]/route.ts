// app/api/[orgSlug]/members/[userId]/route.ts
// UPDATED: Add targetSnapshot for member removal
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { getRoleHierarchy, type OrganizationRole } from '@/lib/role-helpers';
import { createAuditLog, getRequestMetadata } from '@/lib/audit-logger';
import { createUserSnapshot } from '@/lib/user-snapshot';

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

    if (!['OWNER', 'ADMIN'].includes(access.role)) {
      return NextResponse.json({ 
        error: 'Only OWNER or ADMIN can remove members' 
      }, { status: 403 });
    }

    if (userId === user.userId) {
      return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.organization.findUnique({
        where: { id: access.organizationId },
        select: { id: true }
      });

      const targetMember = await tx.organizationUser.findFirst({
        where: { organizationId: access.organizationId, userId },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      });

      if (!targetMember) {
        throw new Error('Member not found');
      }

      const targetRole = targetMember.roles as OrganizationRole;
      const managerRole = access.role as OrganizationRole;

      const managerLevel = getRoleHierarchy(managerRole);
      const targetLevel = getRoleHierarchy(targetRole);

      if (managerLevel <= targetLevel) {
        throw new Error(`Cannot remove ${targetRole}. You can only remove members with lower roles.`);
      }

      if (targetRole === 'OWNER') {
        const remainingOwners = await tx.organizationUser.count({
          where: { 
            organizationId: access.organizationId, 
            roles: 'OWNER',
            userId: { not: userId },
            isActive: true
          }
        });
        
        if (remainingOwners === 0) {
          throw new Error('Cannot remove the last OWNER.');
        }
      }

      await tx.organizationUser.delete({
        where: {
          organizationId_userId: {
            organizationId: access.organizationId,
            userId,
          },
        },
      });

      // ✅ NEW: Create snapshots for both actor and target
      const actorSnapshot = await createUserSnapshot(user.userId, access.organizationId);
      const targetSnapshot = await createUserSnapshot(userId, access.organizationId);
      
      // ✅ Create audit log with both snapshots
      const { ipAddress, userAgent } = getRequestMetadata(request);
      
      await createAuditLog({
        organizationId: access.organizationId,
        userId: user.userId,
        userSnapshot: actorSnapshot, // ✅ Who removed
        targetUserId: userId,
        targetSnapshot: targetSnapshot, // ✅ Who was removed
        action: 'members.removed',
        category: 'USER',
        severity: 'CRITICAL',
        description: `ลบสมาชิก ${targetMember.user.firstName} ${targetMember.user.lastName} ออกจากองค์กร`,
        resourceId: targetMember.id,
        resourceType: 'OrganizationUser',
        payload: {
          removedUserName: `${targetMember.user.firstName} ${targetMember.user.lastName}`,
          removedUserEmail: targetMember.user.email,
          previousRole: targetMember.roles,
          removedByRole: access.role,
        },
        ipAddress,
        userAgent,
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Member removed successfully',
    });

  } catch (error) {
    console.error('Remove member failed:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: error.message 
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}