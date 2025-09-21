// app/api/organizations/join-by-code/route.ts
// Join Organization by Invite Code API

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerUser } from '@/lib/auth-server';
import { z } from 'zod';
import arcjet, { shield, tokenBucket } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: "LIVE" }),
    tokenBucket({
      mode: "LIVE",
      characteristics: ["ip.src"],
      refillRate: 3,
      interval: "5m",
      capacity: 10,
    }),
  ],
});

const JoinByCodeSchema = z.object({
  inviteCode: z.string().min(6).max(50).trim(),
});

export async function POST(request: NextRequest) {
  try {
    const decision = await aj.protect(request, { requested: 1 });
    if (decision.isDenied()) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const validation = JoinByCodeSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid invite code format'
      }, { status: 400 });
    }

    const { inviteCode } = validation.data;

    // Find active invitation by code
    const invitation = await prisma.userInvitation.findFirst({
      where: {
        // Note: You'll need to add inviteCode field to UserInvitation schema
        // For now, using a combination of fields as temporary solution
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            status: true,
          }
        }
      }
    });

    if (!invitation) {
      return NextResponse.json({
        error: 'Invalid or expired invite code'
      }, { status: 404 });
    }

    if (invitation.organization.status !== 'ACTIVE') {
      return NextResponse.json({
        error: 'Organization is not active'
      }, { status: 403 });
    }

    // Check if user is already a member
    const existingMembership = await prisma.organizationUser.findUnique({
      where: {
        organizationId_userId: {
          organizationId: invitation.organizationId,
          userId: user.userId
        }
      }
    });

    if (existingMembership) {
      return NextResponse.json({
        error: 'You are already a member of this organization'
      }, { status: 409 });
    }

    // Join organization with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization membership
      const organizationUser = await tx.organizationUser.create({
        data: {
          organizationId: invitation.organizationId,
          userId: user.userId,
          roles: invitation.organizationRole || 'MEMBER',
          isOwner: false,
          isActive: true,
          joinedAt: new Date(),
        }
      });

      // Update invitation status
      await tx.userInvitation.update({
        where: { id: invitation.id },
        data: {
          status: 'ACCEPTED',
          inviteeId: user.userId,
          respondedAt: new Date(),
        }
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          organizationId: invitation.organizationId,
          userId: user.userId,
          action: 'users.joined_by_code',
          payload: {
            invitationId: invitation.id,
            organizationName: invitation.organization.name,
            timestamp: new Date().toISOString(),
          }
        }
      });

      return { organizationUser, organization: invitation.organization };
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully joined organization',
      organization: result.organization
    });

  } catch (error) {
    console.error('Join by code error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}