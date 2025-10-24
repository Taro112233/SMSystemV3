// app/api/[orgSlug]/product-units/route.ts
// Product Units Management API - List & Create
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { createAuditLog, getRequestMetadata } from '@/lib/audit-logger';
import { createUserSnapshot } from '@/lib/user-snapshot';
import { Decimal } from '@prisma/client/runtime/library';

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
        { isBaseUnit: 'desc' },  // Base unit first
        { isActive: 'desc' },
        { displayOrder: 'asc' },
        { name: 'asc' }
      ],
    });

    // Convert Decimal to number for JSON response
    const unitsWithNumbers = units.map(unit => ({
      ...unit,
      conversionRatio: Number(unit.conversionRatio),
    }));

    return NextResponse.json({
      success: true,
      units: unitsWithNumbers,
      stats: {
        total: units.length,
        active: units.filter(u => u.isActive).length,
        inactive: units.filter(u => !u.isActive).length,
        hasBaseUnit: units.some(u => u.isBaseUnit && u.isActive),
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
    const { 
      name, 
      symbol, 
      description, 
      conversionRatio, 
      isBaseUnit, 
      displayOrder, 
      isActive 
    } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Unit name is required' },
        { status: 400 }
      );
    }

    if (conversionRatio === undefined || conversionRatio <= 0) {
      return NextResponse.json(
        { error: 'Conversion ratio must be greater than 0' },
        { status: 400 }
      );
    }

    // Check if base unit already exists (if trying to create new base unit)
    if (isBaseUnit) {
      const existingBaseUnit = await prisma.productUnit.findFirst({
        where: {
          organizationId: access.organizationId,
          isBaseUnit: true,
          isActive: true,
        }
      });

      if (existingBaseUnit) {
        return NextResponse.json(
          { error: 'Organization already has a base unit' },
          { status: 409 }
        );
      }

      // Base unit must have conversion ratio = 1
      if (conversionRatio !== 1) {
        return NextResponse.json(
          { error: 'Base unit must have conversion ratio of 1' },
          { status: 400 }
        );
      }
    }

    // Check unique name
    const existingUnit = await prisma.productUnit.findFirst({
      where: {
        organizationId: access.organizationId,
        name: name.trim(),
      },
    });

    if (existingUnit) {
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
        symbol: symbol?.trim() || null,
        description: description?.trim() || null,
        conversionRatio: new Decimal(conversionRatio),
        isBaseUnit: isBaseUnit ?? false,
        displayOrder: displayOrder ?? 0,
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
      action: 'product_units.create',
      category: 'PRODUCT',
      severity: 'INFO',
      description: `สร้างหน่วยนับ ${unit.name} (อัตราส่วน: ${conversionRatio})`,
      resourceId: unit.id,
      resourceType: 'ProductUnit',
      payload: {
        unitName: name,
        conversionRatio,
        isBaseUnit: isBaseUnit ?? false,
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