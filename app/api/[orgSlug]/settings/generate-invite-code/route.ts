// FILE: app/api/[orgSlug]/settings/generate-invite-code/route.ts
// Settings API - Generate new invite code
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

export async function POST(
  request: NextRequest,
  { params }: { params: { orgSlug: string } }
) {
  try {
    // Check authentication
    const user = getUserFromHeaders(request.headers);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check organization access
    const access = await getUserOrgRole(user.userId, params.orgSlug);
    if (!access) {
      return NextResponse.json(
        { error: 'No access to organization' },
        { status: 403 }
      );
    }

    // Only OWNER can generate invite code
    if (access.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Only OWNER can generate invite codes' },
        { status: 403 }
      );
    }

    // Generate new invite code (8 characters, URL-safe)
    const inviteCode = nanoid(8);

    // Update organization with new invite code
    const updatedOrg = await prisma.organization.update({
      where: {
        id: access.organizationId,
      },
      data: {
        inviteCode,
        inviteEnabled: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: access.organizationId,
        userId: user.userId,
        action: 'INVITE_CODE_GENERATED',
        entityType: 'ORGANIZATION',
        entityId: access.organizationId,
        metadata: {
          inviteCode,
        },
      },
    });

    return NextResponse.json({
      success: true,
      inviteCode: updatedOrg.inviteCode,
      message: 'Invite code generated successfully',
    });
  } catch (error) {
    console.error('Generate invite code failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}