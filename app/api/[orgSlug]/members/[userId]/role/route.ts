// FILE: app/api/[orgSlug]/members/[userId]/role/route.ts
// Members API - Update member role - FIXED WITH VALIDATION
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { isValidRole, canChangeRole, MAX_ADMINS, type OrganizationRole } from '@/lib/role-helpers';

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

    // ✅ FIXED: Validate role using centralized helper
    if (!isValidRole(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // ✅ FIXED: Use transaction to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      // Get target member's current role
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

      // ✅ FIXED: Check if manager can change this role
      if (!canChangeRole(access.role as OrganizationRole, currentRole, role)) {
        throw new Error(`You don't have permission to change ${currentRole} to ${role}`);
      }

      // ✅ NEW: Prevent ADMIN from changing their own role
      if (access.role === 'ADMIN' && userId === user.userId) {
        throw new Error('Cannot change your own role. Ask another ADMIN or OWNER.');
      }

      // ✅ NEW: If demoting an OWNER, check if there are other OWNERs
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

      // ✅ NEW: If OWNER is trying to demote themselves
      if (userId === user.userId && currentRole === 'OWNER' && role !== 'OWNER') {
        throw new Error('Cannot demote yourself. Ask another OWNER to change your role.');
      }

      // ✅ NEW: Check ADMIN quota limit
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

      // Update member role
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

      // ✅ FIXED: Create audit log with oldRole
      await tx.auditLog.create({
        data: {
          organizationId: access.organizationId,
          userId: user.userId,
          action: 'members.role_updated',
          resourceId: updatedMember.id,
          payload: {
            targetUserId: userId,
            targetUserName: `${updatedMember.user.firstName} ${updatedMember.user.lastName}`,
            oldRole: currentRole, // ✅ บันทึก oldRole
            newRole: role,
            changedBy: user.userId,
            timestamp: new Date().toISOString(),
          },
        },
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
    
    // Handle specific errors
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: error.message 
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}