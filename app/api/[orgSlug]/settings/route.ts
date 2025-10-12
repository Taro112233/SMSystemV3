// app/api/[orgSlug]/settings/route.ts
// UPDATED: Add userSnapshot for organization settings updates
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { createAuditLog, getRequestMetadata } from '@/lib/audit-logger';
import { ColorTheme, IconType, Prisma } from '@prisma/client';
import { createUserSnapshot } from '@/lib/user-snapshot';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  try {
    const { orgSlug } = await params;
    
    const user = getUserFromHeaders(request.headers);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const access = await getUserOrgRole(user.userId, orgSlug);
    if (!access) {
      return NextResponse.json(
        { error: 'No access to organization' },
        { status: 403 }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: {
        id: access.organizationId,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        email: true,
        phone: true,
        timezone: true,
        color: true,
        icon: true,
        inviteCode: true,
        inviteEnabled: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      organization,
      userRole: access.role,
    });
  } catch (error) {
    console.error('Get organization settings failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  try {
    const { orgSlug } = await params;
    
    const user = getUserFromHeaders(request.headers);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const access = await getUserOrgRole(user.userId, orgSlug);
    if (!access) {
      return NextResponse.json(
        { error: 'No access to organization' },
        { status: 403 }
      );
    }

    if (!['ADMIN', 'OWNER'].includes(access.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. ADMIN or OWNER required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      name, 
      slug, 
      description, 
      email, 
      phone, 
      timezone, 
      color,
      icon,
      inviteEnabled,
      inviteCode
    } = body;

    const isInviteOnlyUpdate = inviteCode !== undefined || inviteEnabled !== undefined;
    
    if (isInviteOnlyUpdate && access.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Only OWNER can update invite code settings' },
        { status: 403 }
      );
    }

    if (name !== undefined || slug !== undefined || timezone !== undefined) {
      if (!name || !slug || !timezone) {
        return NextResponse.json(
          { error: 'Name, slug, and timezone are required' },
          { status: 400 }
        );
      }

      if (!/^[a-z0-9-]+$/.test(slug)) {
        return NextResponse.json(
          { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
          { status: 400 }
        );
      }
    }

    const currentOrg = await prisma.organization.findUnique({
      where: { id: access.organizationId },
      select: {
        name: true,
        slug: true,
        description: true,
        email: true,
        phone: true,
        timezone: true,
        color: true,
        icon: true,
        inviteCode: true,
        inviteEnabled: true,
      },
    });

    if (!currentOrg) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (email !== undefined) updateData.email = email || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (color !== undefined) updateData.color = color as ColorTheme;
    if (icon !== undefined) updateData.icon = icon as IconType;
    if (inviteEnabled !== undefined) updateData.inviteEnabled = inviteEnabled;
    if (inviteCode !== undefined) updateData.inviteCode = inviteCode;

    if (slug !== undefined && slug !== orgSlug) {
      if (access.role !== 'OWNER') {
        return NextResponse.json(
          { error: 'Only OWNER can change organization slug' },
          { status: 403 }
        );
      }

      const existingOrg = await prisma.organization.findUnique({
        where: { slug },
      });

      if (existingOrg && existingOrg.id !== access.organizationId) {
        return NextResponse.json(
          { error: 'This slug is already taken' },
          { status: 409 }
        );
      }

      updateData.slug = slug;
    }

    // ✅ NEW: Create user snapshot
    const userSnapshot = await createUserSnapshot(user.userId, access.organizationId);

    const updatedOrg = await prisma.organization.update({
      where: {
        id: access.organizationId,
      },
      data: updateData,
    });

    // ✅ Create audit log with snapshot
    const { ipAddress, userAgent } = getRequestMetadata(request);
    
    let severity: 'INFO' | 'WARNING' = 'INFO';
    if (updateData.slug || updateData.inviteCode || updateData.inviteEnabled !== undefined) {
      severity = 'WARNING';
    }

    await createAuditLog({
      organizationId: access.organizationId,
      userId: user.userId,
      userSnapshot, // ✅ Pass snapshot
      action: 'organization.settings_updated',
      category: 'ORGANIZATION',
      severity,
      description: `แก้ไขการตั้งค่าองค์กร`,
      resourceId: access.organizationId,
      resourceType: 'Organization',
      payload: {
  before: currentOrg,
  after: updateData as Prisma.InputJsonValue,
  changes: Object.keys(updateData),
} as Prisma.InputJsonValue,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      organization: updatedOrg,
      message: 'Organization settings updated successfully',
    });
  } catch (error) {
    console.error('Update organization settings failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}