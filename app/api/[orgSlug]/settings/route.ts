// app/api/[orgSlug]/settings/route.ts
// Organization Settings API - Update organization info

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const UpdateOrgSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional().nullable(),
  email: z.string().email().max(255).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  timezone: z.string().max(50).optional(),
  inviteEnabled: z.boolean().optional(),
});

export async function PATCH(
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

    // Check organization access and permissions
    const access = await getUserOrgRole(user.userId, orgSlug);
    if (!access) {
      return NextResponse.json({ error: 'No access to organization' }, { status: 403 });
    }

    // Check if user has permission (ADMIN or OWNER)
    if (!['ADMIN', 'OWNER'].includes(access.role)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions',
        message: 'Only ADMIN or OWNER can update organization settings' 
      }, { status: 403 });
    }

    const body = await request.json();
    const validation = UpdateOrgSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid input data',
        details: validation.error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    const updateData = validation.data;

    // If slug is being changed, check it's not taken (OWNER only)
    if (updateData.slug && updateData.slug !== orgSlug) {
      if (access.role !== 'OWNER') {
        return NextResponse.json({
          error: 'Only OWNER can change organization slug'
        }, { status: 403 });
      }

      const existingOrg = await prisma.organization.findUnique({
        where: { slug: updateData.slug }
      });

      if (existingOrg) {
        return NextResponse.json({
          error: 'Organization slug already exists'
        }, { status: 409 });
      }
    }

    // Update organization
    const updatedOrg = await prisma.organization.update({
      where: { id: access.organizationId },
      data: updateData,
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
        updatedAt: true,
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: access.organizationId,
        userId: user.userId,
        action: 'organizations.settings_updated',
        payload: {
          changes: updateData,
          timestamp: new Date().toISOString(),
        }
      }
    });

    console.log(`✅ Organization settings updated: ${updatedOrg.name} by ${user.userId}`);

    return NextResponse.json({
      success: true,
      message: 'Organization updated successfully',
      organization: updatedOrg
    });

  } catch (error) {
    console.error('Update organization settings error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}