// app/api/organizations/join-by-code/route.ts
// Join Organization by Invite Code API - Complete Implementation

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
  inviteCode: z.string()
    .min(9)
    .max(10)
    .regex(/^ORG-[A-Z0-9]{6}$/, 'Invalid invite code format. Should be ORG-XXXXXX'),
});

export async function POST(request: NextRequest) {
  try {
    const decision = await aj.protect(request, { requested: 1 });
    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return NextResponse.json(
          { 
            success: false,
            error: "Too many join attempts", 
            message: "Please wait 5 minutes before trying again",
            retryAfter: 300
          },
          { 
            status: 429,
            headers: { 'Retry-After': '300' }
          }
        );
      }
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 });
    }

    const body = await request.json();
    const validation = JoinByCodeSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid invite code format',
        details: validation.error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    const { inviteCode } = validation.data;

    console.log(`📝 Join attempt with code: ${inviteCode} by user: ${user.userId} from IP: ${clientIp}`);

    // Find organization by invite code
    const organization = await prisma.organization.findUnique({
      where: { 
        inviteCode: inviteCode.toUpperCase(),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        status: true,
        inviteEnabled: true,
        timezone: true,
        email: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        // Count current members
        _count: {
          select: {
            users: {
              where: { isActive: true }
            }
          }
        }
      }
    });

    if (!organization) {
      console.log(`❌ Invalid invite code: ${inviteCode} from IP: ${clientIp}`);
      return NextResponse.json({
        success: false,
        error: 'Invalid invite code',
        message: 'The invite code you entered does not exist or has expired'
      }, { status: 404 });
    }

    // Check if organization is active and invites are enabled
    if (organization.status !== 'ACTIVE') {
      console.log(`❌ Organization not active: ${organization.name} from IP: ${clientIp}`);
      return NextResponse.json({
        success: false,
        error: 'Organization not available',
        message: 'This organization is currently not accepting new members'
      }, { status: 403 });
    }

    if (!organization.inviteEnabled) {
      console.log(`❌ Invites disabled for org: ${organization.name} from IP: ${clientIp}`);
      return NextResponse.json({
        success: false,
        error: 'Invitations disabled',
        message: 'This organization has disabled invite codes'
      }, { status: 403 });
    }

    // Check if user is already a member
    const existingMembership = await prisma.organizationUser.findUnique({
      where: {
        organizationId_userId: {
          organizationId: organization.id,
          userId: user.userId
        }
      },
      select: {
        id: true,
        isActive: true,
        roles: true,
        joinedAt: true
      }
    });

    if (existingMembership) {
      if (existingMembership.isActive) {
        console.log(`❌ User already member of org: ${organization.name} from IP: ${clientIp}`);
        return NextResponse.json({
          success: false,
          error: 'Already a member',
          message: 'You are already a member of this organization',
          organization: {
            name: organization.name,
            slug: organization.slug,
            role: existingMembership.roles,
            joinedAt: existingMembership.joinedAt
          }
        }, { status: 409 });
      } else {
        // Reactivate inactive membership
        await prisma.organizationUser.update({
          where: { id: existingMembership.id },
          data: {
            isActive: true,
            joinedAt: new Date() // Update join date
          }
        });

        console.log(`✅ Reactivated membership: ${user.userId} to ${organization.name}`);
      }
    } else {
      // Create new membership
      await prisma.organizationUser.create({
        data: {
          organizationId: organization.id,
          userId: user.userId,
          roles: 'MEMBER', // New members always start as MEMBER
          isActive: true,
          joinedAt: new Date(),
          lastActiveAt: new Date()
        }
      });

      console.log(`✅ New membership created: ${user.userId} to ${organization.name}`);
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: organization.id,
        userId: user.userId,
        action: 'users.joined_by_invite_code',
        payload: {
          inviteCode,
          organizationName: organization.name,
          organizationSlug: organization.slug,
          userEmail: user.email,
          userFullName: `${user.firstName} ${user.lastName}`,
          timestamp: new Date().toISOString(),
          ip: clientIp,
          userAgent: request.headers.get('user-agent')?.substring(0, 100)
        }
      }
    });

    // Return success response with organization info
    const responseOrganization = {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      description: organization.description,
      memberCount: organization._count.users + 1, // Include the new member
      userRole: 'MEMBER',
      isOwner: false,
      joinedAt: new Date(),
      isActive: true
    };

    console.log(`✅ Successfully joined organization: ${user.userId} to ${organization.name}`);

    return NextResponse.json({
      success: true,
      message: `Successfully joined ${organization.name}`,
      organization: responseOrganization,
      nextSteps: [
        'You can now access organization resources',
        'Visit the organization dashboard to get started',
        'Contact an admin if you need additional permissions'
      ]
    });

  } catch (error) {
    console.error('Join by code error:', error);
    
    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: any };
      
      if (prismaError.code === 'P2002') {
        return NextResponse.json({
          success: false,
          error: 'Membership conflict',
          message: 'There was a conflict creating your membership. Please try again.'
        }, { status: 409 });
      }
    }

    return NextResponse.json({ 
      success: false,
      error: "Internal server error",
      message: "Something went wrong while joining the organization. Please try again."
    }, { status: 500 });
  }
}

// GET method to validate invite code without joining
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inviteCode = searchParams.get('code');

    if (!inviteCode) {
      return NextResponse.json({
        success: false,
        error: 'Invite code required'
      }, { status: 400 });
    }

    const validation = JoinByCodeSchema.safeParse({ inviteCode });
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid invite code format'
      }, { status: 400 });
    }

    // Find organization by invite code (public info only)
    const organization = await prisma.organization.findUnique({
      where: { 
        inviteCode: inviteCode.toUpperCase(),
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        inviteEnabled: true,
        _count: {
          select: {
            users: {
              where: { isActive: true }
            }
          }
        }
      }
    });

    if (!organization || organization.status !== 'ACTIVE' || !organization.inviteEnabled) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'Invalid or disabled invite code'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      valid: true,
      organization: {
        name: organization.name,
        description: organization.description,
        memberCount: organization._count.users,
        status: organization.status
      },
      message: `Ready to join ${organization.name}`
    });

  } catch (error) {
    console.error('Validate invite code error:', error);
    return NextResponse.json({ 
      success: false,
      error: "Internal server error" 
    }, { status: 500 });
  }
}