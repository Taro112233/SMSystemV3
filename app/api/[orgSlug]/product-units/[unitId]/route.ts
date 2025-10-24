// app/api/[orgSlug]/product-units/[unitId]/route.ts
// Product Units API - Get, Update, Delete (SIMPLIFIED)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { createAuditLog, getRequestMetadata } from '@/lib/audit-logger';
import { createUserSnapshot } from '@/lib/user-snapshot';
import { isUnitNameUnique } from '@/lib/unit-helpers';

// GET - Get specific product unit
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; unitId: string }> }
) {
  try {
    const { orgSlug, unitId } = await params;
    
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

    const unit = await prisma.productUnit.findFirst({
      where: {
        id: unitId,
        organizationId: access.organizationId,
      },
    });

    if (!unit) {
      return NextResponse.json(
        { error: 'Product unit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      unit: {
        ...unit,
        conversionRatio: Number(unit.conversionRatio),
      },
    });
  } catch (error) {
    console.error('Get product unit failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update product unit
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; unitId: string }> }
) {
  try {
    const { orgSlug, unitId } = await params;
    
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
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const existingUnit = await prisma.productUnit.findFirst({
      where: {
        id: unitId,
        organizationId: access.organizationId,
      },
    });

    if (!existingUnit) {
      return NextResponse.json(
        { error: 'Product unit not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, conversionRatio, isActive } = body;

    // Validation
    if (name && !name.trim()) {
      return NextResponse.json(
        { error: 'Name cannot be empty' },
        { status: 400 }
      );
    }

    if (conversionRatio !== undefined && conversionRatio <= 0) {
      return NextResponse.json(
        { error: 'Conversion ratio must be greater than 0' },
        { status: 400 }
      );
    }

    // Check unique name if changed
    if (name && name.trim() !== existingUnit.name) {
      const isUnique = await isUnitNameUnique(access.organizationId, name, unitId);
      if (!isUnique) {
        return NextResponse.json(
          { error: 'Unit with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Create user snapshot
    const userSnapshot = await createUserSnapshot(user.userId, access.organizationId);

    // Update product unit
    const updatedUnit = await prisma.productUnit.update({
      where: {
        id: unitId,
      },
      data: {
        ...(name && { name: name.trim() }),
        ...(conversionRatio !== undefined && { conversionRatio }),
        ...(isActive !== undefined && { isActive }),
        updatedBy: user.userId,
        updatedBySnapshot: userSnapshot,
      },
    });

    // Create audit log
    const { ipAddress, userAgent } = getRequestMetadata(request);
    
    await createAuditLog({
      organizationId: access.organizationId,
      userId: user.userId,
      userSnapshot,
      action: 'units.update',
      category: 'PRODUCT',
      severity: 'INFO',
      description: `แก้ไขหน่วยนับ ${updatedUnit.name}`,
      resourceId: unitId,
      resourceType: 'ProductUnit',
      payload: {
        before: {
          name: existingUnit.name,
          conversionRatio: Number(existingUnit.conversionRatio),
          isActive: existingUnit.isActive,
        },
        after: {
          name: updatedUnit.name,
          conversionRatio: Number(updatedUnit.conversionRatio),
          isActive: updatedUnit.isActive,
        },
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      unit: {
        ...updatedUnit,
        conversionRatio: Number(updatedUnit.conversionRatio),
      },
      message: 'Product unit updated successfully',
    });
  } catch (error) {
    console.error('Update product unit failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete product unit
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; unitId: string }> }
) {
  try {
    const { orgSlug, unitId } = await params;
    
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
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const unit = await prisma.productUnit.findFirst({
      where: {
        id: unitId,
        organizationId: access.organizationId,
      },
    });

    if (!unit) {
      return NextResponse.json(
        { error: 'Product unit not found' },
        { status: 404 }
      );
    }

    // Create user snapshot before deletion
    const userSnapshot = await createUserSnapshot(user.userId, access.organizationId);

    // Delete product unit
    await prisma.productUnit.delete({
      where: {
        id: unitId,
      },
    });

    // Create audit log
    const { ipAddress, userAgent } = getRequestMetadata(request);
    
    await createAuditLog({
      organizationId: access.organizationId,
      userId: user.userId,
      userSnapshot,
      action: 'units.delete',
      category: 'PRODUCT',
      severity: 'WARNING',
      description: `ลบหน่วยนับ ${unit.name}`,
      resourceId: unitId,
      resourceType: 'ProductUnit',
      payload: {
        unitName: unit.name,
        conversionRatio: Number(unit.conversionRatio),
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: 'Product unit deleted successfully',
    });
  } catch (error) {
    console.error('Delete product unit failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}