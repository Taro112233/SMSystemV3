// FILE: app/api/[orgSlug]/settings/route.ts
// Settings API - Get and Update Organization Settings
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

// GET - Get organization settings
export async function GET(
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

    // Get organization details
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

// PATCH - Update organization settings
export async function PATCH(
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

    // Check permission - only ADMIN and OWNER can update
    if (!['ADMIN', 'OWNER'].includes(access.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. ADMIN or OWNER required.' },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const { name, slug, description, email, phone, timezone, inviteEnabled } = body;

    // Validate required fields
    if (!name || !slug || !timezone) {
      return NextResponse.json(
        { error: 'Name, slug, and timezone are required' },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      name,
      description: description || null,
      email: email || null,
      phone: phone || null,
      timezone,
      inviteEnabled: inviteEnabled ?? true,
    };

    // Only OWNER can change slug
    if (slug !== orgSlug) {
      if (access.role !== 'OWNER') {
        return NextResponse.json(
          { error: 'Only OWNER can change organization slug' },
          { status: 403 }
        );
      }

      // Check if new slug is already taken
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

    // Update organization
    const updatedOrg = await prisma.organization.update({
      where: {
        id: access.organizationId,
      },
      data: updateData,
    });

    // ✅ FIXED: Create audit log without entityType
    await prisma.auditLog.create({
      data: {
        organizationId: access.organizationId,
        userId: user.userId,
        action: 'organization.updated',
        resourceId: access.organizationId,
        payload: {
          changes: updateData,
        },
      },
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