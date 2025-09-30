// app/api/[orgSlug]/settings/generate-invite-code/route.ts
// Generate new invite code API - OWNER only

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'ORG-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  try {
    const { orgSlug } = await params;
    
    // Get user from headers
    const user = getUserFromHeaders(request.headers);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check organization access
    const access = await getUserOrgRole(user.userId, orgSlug);
    if (!access) {
      return NextResponse.json({ error: 'No access to organization' }, { status: 403 });
    }

    // Only OWNER can generate new invite code
    if (access.role !== 'OWNER') {
      return NextResponse.json({ 
        error: 'Insufficient permissions',
        message: 'Only OWNER can generate new invite codes' 
      }, { status: 403 });
    }

    // Generate unique invite code
    let newCode: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      newCode = generateInviteCode();
      const existing = await prisma.organization.findUnique({
        where: { inviteCode: newCode }
      });
      
      if (!existing) break;
      
      attempts++;
      if (attempts >= maxAttempts) {
        throw new Error('Failed to generate unique invite code');
      }
    } while (true);

    // Update organization with new invite code
    const updatedOrg = await prisma.organization.update({
      where: { id: access.organizationId },
      data: { 
        inviteCode: newCode,
        inviteEnabled: true // Auto-enable when generating new code
      },
      select: {
        id: true,
        name: true,
        inviteCode: true,
        inviteEnabled: true,
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: access.organizationId,
        userId: user.userId,
        action: 'organizations.invite_code_regenerated',
        payload: {
          newCode: newCode,
          timestamp: new Date().toISOString(),
        }
      }
    });

    console.log(`✅ New invite code generated for ${updatedOrg.name}: ${newCode}`);

    return NextResponse.json({
      success: true,
      message: 'Invite code generated successfully',
      inviteCode: updatedOrg.inviteCode,
      inviteEnabled: updatedOrg.inviteEnabled
    });

  } catch (error) {
    console.error('Generate invite code error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}