// app/api/[orgSlug]/[deptSlug]/stocks/[stockId]/route.ts
// Stock Detail API - Update stock configuration

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { createAuditLog, getRequestMetadata } from '@/lib/audit-logger';
import { createUserSnapshot } from '@/lib/user-snapshot';

// PATCH - Update stock configuration
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; deptSlug: string; stockId: string }> }
) {
  try {
    const { orgSlug, deptSlug, stockId } = await params;
    
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

    // Check permissions
    if (!['MEMBER', 'ADMIN', 'OWNER'].includes(access.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get department
    const department = await prisma.department.findFirst({
      where: {
        organizationId: access.organizationId,
        slug: deptSlug,
        isActive: true,
      },
    });

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    // Get existing stock
    const existingStock = await prisma.stock.findFirst({
      where: {
        id: stockId,
        departmentId: department.id,
      },
      include: {
        product: true,
      },
    });

    if (!existingStock) {
      return NextResponse.json(
        { error: 'Stock not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      location,
      minStockLevel,
      maxStockLevel,
      reorderPoint,
      defaultWithdrawalQty,
    } = body;

    // Create user snapshot
    const userSnapshot = await createUserSnapshot(user.userId, access.organizationId);

    // Update stock configuration
    const updatedStock = await prisma.stock.update({
      where: { id: stockId },
      data: {
        location: location || null,
        minStockLevel: minStockLevel || null,
        maxStockLevel: maxStockLevel || null,
        reorderPoint: reorderPoint || null,
        defaultWithdrawalQty: defaultWithdrawalQty || null,
        updatedBy: user.userId,
        updatedBySnapshot: userSnapshot,
      },
    });

    // Audit log
    const { ipAddress, userAgent } = getRequestMetadata(request);
    await createAuditLog({
      organizationId: access.organizationId,
      userId: user.userId,
      userSnapshot,
      departmentId: department.id,
      action: 'stocks.update_config',
      category: 'STOCK',
      severity: 'INFO',
      description: `แก้ไขการตั้งค่าสต็อก ${existingStock.product.name}`,
      resourceId: stockId,
      resourceType: 'Stock',
      payload: {
        before: {
          location: existingStock.location,
          minStockLevel: existingStock.minStockLevel,
          maxStockLevel: existingStock.maxStockLevel,
          reorderPoint: existingStock.reorderPoint,
        },
        after: {
          location,
          minStockLevel,
          maxStockLevel,
          reorderPoint,
        },
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      data: updatedStock,
      message: 'Stock configuration updated successfully',
    });
  } catch (error) {
    console.error('Update stock failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}