// app/api/organizations/join-by-code/route.ts
// UPDATED: Add userSnapshot for join by code
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerUser } from '@/lib/auth-server';
import { z } from 'zod';
import arcjet, { shield, tokenBucket } from "@arcjet/next";
import { createAuditLog, getRequestMetadata } from '@/lib/audit-logger';
import { createUserSnapshot } from '@/lib/user-snapshot';

// ===== ARCJET SECURITY =====
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: "LIVE" }),
    tokenBucket({
      mode: "LIVE",
      characteristics: ["ip.src"],
      refillRate: 3, // 3 requests per interval
      interval: "5m", // 5 minutes
      capacity: 10, // 10 requests max
    }),
  ],
});

// ===== VALIDATION SCHEMA =====
const JoinByCodeSchema = z.object({
  inviteCode: z.string()
    .min(6, 'Invite code must be at least 6 characters')
    .max(20, 'Invite code must be at most 20 characters')
    .trim(),
});

interface ValidationError {
  field: string;
  message: string;
}

// ===== POST - Join organization by invite code =====
export async function POST(request: NextRequest) {
  try {
    // Security check
    const decision = await aj.protect(request, { requested: 1 });
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return NextResponse.json(
          { error: "Too many join attempts. Please try again later.", retryAfter: 300 },
          { status: 429, headers: { 'Retry-After': '300' } }
        );
      }
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Authentication check
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = JoinByCodeSchema.safeParse(body);
    
    if (!validation.success) {
      const details: ValidationError[] = validation.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return NextResponse.json({
        success: false,
        error: 'Invalid invite code format',
        details
      }, { status: 400 });
    }

    const { inviteCode } = validation.data;

    // Find organization by invite code
    const organization = await prisma.organization.findFirst({
      where: {
        inviteCode: inviteCode,
        inviteEnabled: true,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        email: true,
        phone: true,
        timezone: true,
        status: true,
        inviteCode: true,
        inviteEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!organization) {
      // ✅ Log failed join attempt with IP only
      const { ipAddress } = getRequestMetadata(request);
      
      console.log(`❌ Invalid invite code attempt: ${inviteCode} by user: ${user.userId} from IP: ${ipAddress}`);
      
      return NextResponse.json({
        success: false,
        error: 'Invalid or disabled invite code'
      }, { status: 404 });
    }

    // Check if user is already a member
    const existingMembership = await prisma.organizationUser.findFirst({
      where: {
        organizationId: organization.id,
        userId: user.userId,
      },
    });

    if (existingMembership) {
      return NextResponse.json({
        success: false,
        error: 'You are already a member of this organization'
      }, { status: 409 });
    }

    // Add user to organization with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization membership
      const organizationUser = await tx.organizationUser.create({
        data: {
          organizationId: organization.id,
          userId: user.userId,
          roles: 'MEMBER', // Default role for invite code join
          isOwner: false,
          isActive: true,
          joinedAt: new Date(),
        },
      });

      // ✅ NEW: Create user snapshot (without org context since just joining)
      const userSnapshot = await createUserSnapshot(user.userId);
      
      // ✅ Create audit log with snapshot
      const { ipAddress, userAgent } = getRequestMetadata(request);
      
      await createAuditLog({
        organizationId: organization.id,
        userId: user.userId,
        userSnapshot, // ✅ Pass snapshot
        action: 'members.joined_by_code',
        category: 'USER',
        severity: 'INFO',
        description: `${user.username} เข้าร่วมองค์กรผ่านรหัสเชิญ`,
        resourceId: organizationUser.id,
        resourceType: 'OrganizationUser',
        payload: {
          joinMethod: 'invite_code',
          inviteCode: inviteCode,
          assignedRole: 'MEMBER',
          userName: user.username,
          userEmail: user.email,
        },
        ipAddress,
        userAgent,
      });

      return organizationUser;
    });

    console.log(`✅ User ${user.userId} joined organization ${organization.id} via invite code`);

    return NextResponse.json({
      success: true,
      message: 'Successfully joined organization',
      organization: {
        ...organization,
        userRole: 'MEMBER',
        isOwner: false,
        joinedAt: result.joinedAt,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Join by code error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}