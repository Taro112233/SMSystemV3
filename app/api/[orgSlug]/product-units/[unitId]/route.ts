// app/api/[orgSlug]/product-units/[unitId]/route.ts
// Product Units Management API - Update & Delete
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { createAuditLog, getRequestMetadata } from '@/lib/audit-logger';
import { createUserSnapshot } from '@/lib/user-snapshot';
import { Decimal } from '@prisma/client/runtime/library';

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
    const { name, symbol, description, conversionRatio, displayOrder, isActive } = body;

    // Validation
    if (name !== undefined && !name.trim()) {
      return NextResponse.json(
        { error: 'Unit name cannot be empty' },
        { status: 400 }
      );
    }

    if (conversionRatio !== undefined && conversionRatio <= 0) {
      return NextResponse.json(
        { error: 'Conversion ratio must be greater than 0' },
        { status: 400 }
      );
    }

    // Prevent changing base unit's conversion ratio
    if (existingUnit.isBaseUnit && conversionRatio !== undefined && conversionRatio !== 1) {
      return NextResponse.json(
        { error: 'Base unit must have conversion ratio of 1' },
        { status: 400 }
      );
    }

    // Check unique name if name is being changed
    if (name !== undefined && name.trim() !== existingUnit.name) {
      const nameConflict = await prisma.productUnit.findFirst({
        where: {
          organizationId: access.organizationId,
          name: name.trim(),
          id: { not: unitId },
        },
      });

      if (nameConflict) {
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
      where: { id: unitId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(symbol !== undefined && { symbol: symbol?.trim() || null }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(conversionRatio !== undefined && { conversionRatio: new Decimal(conversionRatio) }),
        ...(displayOrder !== undefined && { displayOrder }),
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
      action: 'product_units.update',
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

    // Prevent deleting base unit
    if (unit.isBaseUnit) {
      return NextResponse.json(
        { error: 'Cannot delete base unit' },
        { status: 400 }
      );
    }

    // Create user snapshot before deletion
    const userSnapshot = await createUserSnapshot(user.userId, access.organizationId);

    await prisma.productUnit.delete({
      where: { id: unitId },
    });

    // Create audit log
    const { ipAddress, userAgent } = getRequestMetadata(request);
    
    await createAuditLog({
      organizationId: access.organizationId,
      userId: user.userId,
      userSnapshot,
      action: 'product_units.delete',
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