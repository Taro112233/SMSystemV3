// app/api/organizations/join-request/route.ts
// Send Join Request API

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerUser } from '@/lib/auth-server';
import { z } from 'zod';
import arcjet, { shield, tokenBucket } from "@arcjet/next";

const aj2 = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: "LIVE" }),
    tokenBucket({
      mode: "LIVE",
      characteristics: ["ip.src"],
      refillRate: 2,
      interval: "15m",
      capacity: 5,
    }),
  ],
});

const JoinRequestSchema = z.object({
  organizationSlug: z.string().min(3).max(50).trim(),
  message: z.string().min(10).max(1000).trim(),
});

export async function POST(request: NextRequest) {
  try {
    const decision = await aj2.protect(request, { requested: 1 });
    if (decision.isDenied()) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const validation = JoinRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid request data',
        details: validation.error.issues
      }, { status: 400 });
    }

    const { organizationSlug, message } = validation.data;

    // Find organization
    const organization = await prisma.organization.findUnique({
      where: { slug: organizationSlug.toLowerCase() },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
      }
    });

    if (!organization) {
      return NextResponse.json({
        error: 'Organization not found'
      }, { status: 404 });
    }

    if (organization.status !== 'ACTIVE') {
      return NextResponse.json({
        error: 'Organization is not accepting new members'
      }, { status: 403 });
    }

    // Check if user is already a member
    const existingMembership = await prisma.organizationUser.findUnique({
      where: {
        organizationId_userId: {
          organizationId: organization.id,
          userId: user.userId
        }
      }
    });

    if (existingMembership) {
      return NextResponse.json({
        error: 'You are already a member of this organization'
      }, { status: 409 });
    }

    // Check for existing pending request
    const existingRequest = await prisma.userInvitation.findFirst({
      where: {
        organizationId: organization.id,
        inviteeUsername: user.username || user.email,
        status: 'PENDING',
        expiresAt: { gt: new Date() }
      }
    });

    if (existingRequest) {
      return NextResponse.json({
        error: 'You already have a pending request for this organization'
      }, { status: 409 });
    }

    // Find an organization admin to receive the request
    const adminUser = await prisma.organizationUser.findFirst({
      where: {
        organizationId: organization.id,
        roles: { in: ['OWNER', 'ADMIN'] },
        isActive: true,
      },
      include: {
        user: {
          select: { id: true }
        }
      }
    });

    if (!adminUser) {
      return NextResponse.json({
        error: 'No administrators found for this organization'
      }, { status: 400 });
    }

    // Create join request
    const invitation = await prisma.userInvitation.create({
      data: {
        organizationId: organization.id,
        inviterId: adminUser.userId,
        inviteeUsername: user.username,
        inviteeEmail: user.email,
        organizationRole: 'MEMBER',
        message,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: organization.id,
        userId: user.userId,
        action: 'users.join_request_sent',
        payload: {
          invitationId: invitation.id,
          organizationName: organization.name,
          message: message.substring(0, 100), // Truncate for logging
          timestamp: new Date().toISOString(),
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Join request sent successfully',
      organization: {
        name: organization.name,
        slug: organization.slug
      }
    });

  } catch (error) {
    console.error('Join request error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}