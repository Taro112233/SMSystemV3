// app/api/organizations/route.ts
// UPDATED: Remove audit log for organization creation
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerUser } from '@/lib/auth-server';
import { z } from 'zod';
import arcjet, { shield, tokenBucket } from "@arcjet/next";
import { ColorTheme, IconType } from '@prisma/client';

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: "LIVE" }),
    tokenBucket({
      mode: "LIVE",
      characteristics: ["ip.src"],
      refillRate: 2,
      interval: "10m",
      capacity: 5,
    }),
  ],
});

const CreateOrganizationSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(500).optional().or(z.literal('')),
  email: z.string().email().max(255).optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  timezone: z.string().max(50).default('Asia/Bangkok'),
  color: z.nativeEnum(ColorTheme).optional().default(ColorTheme.BLUE),
  icon: z.nativeEnum(IconType).optional().default(IconType.BUILDING),
});

interface ValidationError {
  field: string;
  message: string;
}

export async function GET(request: NextRequest) {
  try {
    const decision = await aj.protect(request, { requested: 1 });
    if (decision.isDenied()) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const organizationUsers = await prisma.organizationUser.findMany({
      where: {
        userId: user.userId,
        isActive: true,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            email: true,
            phone: true,
            status: true,
            timezone: true,
            color: true,
            icon: true,
            inviteCode: true,
            inviteEnabled: true,
            createdAt: true,
            updatedAt: true,
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    });

    const organizations = organizationUsers.map(orgUser => ({
      ...orgUser.organization,
      userRole: orgUser.roles,
      isOwner: orgUser.isOwner,
      joinedAt: orgUser.joinedAt,
    }));

    return NextResponse.json({
      success: true,
      organizations,
      count: organizations.length
    });

  } catch (error) {
    console.error('Get organizations error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const decision = await aj.protect(request, { requested: 2 });
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return NextResponse.json(
          { error: "Too many organization creation attempts", retryAfter: 600 },
          { status: 429, headers: { 'Retry-After': '600' } }
        );
      }
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const validation = CreateOrganizationSchema.safeParse(body);
    
    if (!validation.success) {
      const details: ValidationError[] = validation.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return NextResponse.json({
        success: false,
        error: 'Invalid input data',
        details
      }, { status: 400 });
    }

    const { name, slug, description, email, phone, timezone, color, icon } = validation.data;

    const existingOrg = await prisma.organization.findUnique({
      where: { slug }
    });

    if (existingOrg) {
      return NextResponse.json({
        success: false,
        error: 'Organization slug already exists',
        details: [{ field: 'slug', message: 'This URL slug is already taken' }]
      }, { status: 409 });
    }

    // ✅ FIXED: Remove audit log from transaction
    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: name.trim(),
          slug: slug.toLowerCase(),
          description: description?.trim() || null,
          email: email?.trim().toLowerCase() || null,
          phone: phone?.trim() || null,
          status: 'ACTIVE',
          timezone,
          color,
          icon,
          inviteEnabled: true,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          email: true,
          phone: true,
          status: true,
          timezone: true,
          color: true,
          icon: true,
          inviteCode: true,
          inviteEnabled: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      const organizationUser = await tx.organizationUser.create({
        data: {
          organizationId: organization.id,
          userId: user.userId,
          roles: 'OWNER',
          isOwner: true,
          isActive: true,
          joinedAt: new Date(),
        }
      });

      // ❌ REMOVED: No audit log for organization creation
      // เหตุผล: Organization creation เป็น user-initiated action
      // ไม่จำเป็นต้อง log เพราะสามารถ track ได้จาก createdAt และ OWNER

      return { organization, organizationUser };
    });

    console.log(`✅ Organization created: ${result.organization.name} by ${user.userId}`);

    return NextResponse.json({
      success: true,
      message: 'Organization created successfully',
      organization: {
        ...result.organization,
        userRole: 'OWNER',
        isOwner: true,
        joinedAt: result.organizationUser.joinedAt,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create organization error:', error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: { target?: string[] } };
      
      if (prismaError.code === 'P2002') {
        const target = prismaError.meta?.target;
        if (target?.includes('slug')) {
          return NextResponse.json({
            success: false,
            error: 'Organization slug already exists'
          }, { status: 409 });
        }
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PATCH() {
  return NextResponse.json({
    error: "Use PATCH /api/organizations/[orgId] for updates"
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({
    error: "Use DELETE /api/organizations/[orgId] for deletion"
  }, { status: 405 });
}