// FILE: app/api/[orgSlug]/settings/generate-invite-code/route.ts
// Settings API - Generate new invite code using crypto
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto'; // ✅ FIXED: Use crypto instead of nanoid

// ✅ FIXED: Generate invite code using crypto
function generateInviteCode(length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const bytes = randomBytes(length);
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  
  return result;
}

export async function POST(
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

    // Only OWNER can generate invite code
    if (access.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Only OWNER can generate invite codes' },
        { status: 403 }
      );
    }

    // Generate new invite code (8 characters, URL-safe)
    const inviteCode = generateInviteCode(8);

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

    // ✅ FIXED: Create audit log without entityType
    await prisma.auditLog.create({
      data: {
        organizationId: access.organizationId,
        userId: user.userId,
        action: 'organization.invite_code_generated',
        resourceId: access.organizationId,
        payload: {
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