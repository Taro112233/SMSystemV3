// app/api/[orgSlug]/product-units/route.ts
// Product Units API - List and Create (SIMPLIFIED)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { createAuditLog, getRequestMetadata } from '@/lib/audit-logger';
import { createUserSnapshot } from '@/lib/user-snapshot';
import { isUnitNameUnique } from '@/lib/unit-helpers';

// GET - List all product units (including inactive)
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

    const units = await prisma.productUnit.findMany({
      where: {
        organizationId: access.organizationId,
      },
      orderBy: [
        { isActive: 'desc' },
        { name: 'asc' }
      ],
    });

    return NextResponse.json({
      success: true,
      units: units.map(unit => ({
        ...unit,
        conversionRatio: Number(unit.conversionRatio),
      })),
      stats: {
        total: units.length,
        active: units.filter(u => u.isActive).length,
        inactive: units.filter(u => !u.isActive).length,
      }
    });
  } catch (error) {
    console.error('Get product units failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new product unit
export async function POST(
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
    const { name, conversionRatio, isActive } = body;

    // Validation
    if (!name || !conversionRatio) {
      return NextResponse.json(
        { error: 'Name and conversionRatio are required' },
        { status: 400 }
      );
    }

    if (conversionRatio <= 0) {
      return NextResponse.json(
        { error: 'Conversion ratio must be greater than 0' },
        { status: 400 }
      );
    }

    // Check unique name
    const isUnique = await isUnitNameUnique(access.organizationId, name);
    if (!isUnique) {
      return NextResponse.json(
        { error: 'Unit with this name already exists' },
        { status: 409 }
      );
    }

    // Create user snapshot
    const userSnapshot = await createUserSnapshot(user.userId, access.organizationId);

    // Create product unit
    const unit = await prisma.productUnit.create({
      data: {
        organizationId: access.organizationId,
        name: name.trim(),
        conversionRatio,
        isActive: isActive ?? true,
        createdBy: user.userId,
        createdBySnapshot: userSnapshot,
      },
    });

    // Create audit log
    const { ipAddress, userAgent } = getRequestMetadata(request);
    
    await createAuditLog({
      organizationId: access.organizationId,
      userId: user.userId,
      userSnapshot,
      action: 'units.create',
      category: 'PRODUCT',
      severity: 'INFO',
      description: `สร้างหน่วยนับ ${unit.name} (อัตราส่วน: ${unit.conversionRatio})`,
      resourceId: unit.id,
      resourceType: 'ProductUnit',
      payload: {
        unitName: name,
        conversionRatio,
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      unit: {
        ...unit,
        conversionRatio: Number(unit.conversionRatio),
      },
      message: 'Product unit created successfully',
    });
  } catch (error) {
    console.error('Create product unit failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}