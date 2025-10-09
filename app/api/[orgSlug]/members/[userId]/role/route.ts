// app/api/[orgSlug]/members/[userId]/role/route.ts
// UPDATED: Add userSnapshot + targetSnapshot for role changes
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { isValidRole, canChangeRole, MAX_ADMINS, type OrganizationRole } from '@/lib/role-helpers';
import { createAuditLog, getRequestMetadata } from '@/lib/audit-logger';
import { createUserSnapshot } from '@/lib/user-snapshot';

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

    if (!isValidRole(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
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

      const currentRole = targetMember.roles as OrganizationRole;

      if (!canChangeRole(access.role as OrganizationRole, currentRole, role)) {
        throw new Error(`You don't have permission to change ${currentRole} to ${role}`);
      }

      if (access.role === 'ADMIN' && userId === user.userId) {
        throw new Error('Cannot change your own role. Ask another ADMIN or OWNER.');
      }

      if (currentRole === 'OWNER' && role !== 'OWNER') {
        const otherOwnerCount = await tx.organizationUser.count({
          where: { 
            organizationId: access.organizationId, 
            roles: 'OWNER',
            userId: { not: userId },
            isActive: true
          }
        });
        
        if (otherOwnerCount === 0) {
          throw new Error('Cannot demote the last OWNER. Promote another member to OWNER first.');
        }
      }

      if (userId === user.userId && currentRole === 'OWNER' && role !== 'OWNER') {
        throw new Error('Cannot demote yourself. Ask another OWNER to change your role.');
      }

      if (role === 'ADMIN' && currentRole !== 'ADMIN') {
        const adminCount = await tx.organizationUser.count({
          where: { 
            organizationId: access.organizationId, 
            roles: 'ADMIN',
            isActive: true
          }
        });
        
        if (adminCount >= MAX_ADMINS) {
          throw new Error(`Maximum ADMIN limit reached (${MAX_ADMINS})`);
        }
      }

      const updatedMember = await tx.organizationUser.update({
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

      // ✅ NEW: Create snapshots for both actor and target
      const actorSnapshot = await createUserSnapshot(user.userId, access.organizationId);
      const targetSnapshot = await createUserSnapshot(userId, access.organizationId);
      
      // ✅ Create audit log with both snapshots
      const { ipAddress, userAgent } = getRequestMetadata(request);
      
      await createAuditLog({
        organizationId: access.organizationId,
        userId: user.userId,
        userSnapshot: actorSnapshot, // ✅ Who made the change
        targetUserId: userId,
        targetSnapshot: targetSnapshot, // ✅ Who was affected
        action: 'members.role_updated',
        category: 'USER',
        severity: 'WARNING',
        description: `เปลี่ยนบทบาท ${updatedMember.user.firstName} ${updatedMember.user.lastName} จาก ${currentRole} เป็น ${role}`,
        resourceId: updatedMember.id,
        resourceType: 'OrganizationUser',
        payload: {
          targetUserName: `${updatedMember.user.firstName} ${updatedMember.user.lastName}`,
          targetUserEmail: updatedMember.user.email,
          oldRole: currentRole,
          newRole: role,
        },
        ipAddress,
        userAgent,
      });

      return updatedMember;
    });

    return NextResponse.json({
      success: true,
      member: result,
      message: 'Member role updated successfully',
    });

  } catch (error) {
    console.error('Update member role failed:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: error.message 
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}