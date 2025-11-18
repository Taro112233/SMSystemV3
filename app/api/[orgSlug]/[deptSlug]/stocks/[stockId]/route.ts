// app/api/[orgSlug]/[deptSlug]/stocks/[stockId]/route.ts
// Single Stock API - Get, Update, Delete

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { createAuditLog, getRequestMetadata } from '@/lib/audit-logger';
import { createUserSnapshot } from '@/lib/user-snapshot';

// ===== GET: Get single stock =====
export async function GET(
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

    // Get stock with batches
    const stock = await prisma.stock.findFirst({
      where: {
        id: stockId,
        departmentId: department.id,
        organizationId: access.organizationId,
      },
      include: {
        product: {
          include: {
            attributes: {
              include: {
                category: true,
                option: true,
              },
            },
          },
        },
        stockBatches: {
          where: { isActive: true },
          orderBy: { expiryDate: 'asc' },
        },
      },
    });

    if (!stock) {
      return NextResponse.json(
        { error: 'Stock not found' },
        { status: 404 }
      );
    }

    // Calculate aggregated quantities
    const batches = stock.stockBatches;
    const totalQuantity = batches.reduce((sum, b) => sum + b.totalQuantity, 0);
    const availableQuantity = batches.reduce((sum, b) => sum + b.availableQuantity, 0);
    const reservedQuantity = batches.reduce((sum, b) => sum + b.reservedQuantity, 0);
    const incomingQuantity = batches.reduce((sum, b) => sum + b.incomingQuantity, 0);

    return NextResponse.json({
      success: true,
      data: {
        ...stock,
        totalQuantity,
        availableQuantity,
        reservedQuantity,
        incomingQuantity,
      },
    });
  } catch (error) {
    console.error('Error fetching stock:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock' },
      { status: 500 }
    );
  }
}

// ===== PATCH: Update stock configuration =====
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
        organizationId: access.organizationId,
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

    // Track changes
    const changes: any = {};
    if (location !== undefined && location !== existingStock.location) {
      changes.location = { from: existingStock.location, to: location };
    }
    if (minStockLevel !== undefined && minStockLevel !== existingStock.minStockLevel) {
      changes.minStockLevel = { from: existingStock.minStockLevel, to: minStockLevel };
    }
    if (maxStockLevel !== undefined && maxStockLevel !== existingStock.maxStockLevel) {
      changes.maxStockLevel = { from: existingStock.maxStockLevel, to: maxStockLevel };
    }
    if (reorderPoint !== undefined && reorderPoint !== existingStock.reorderPoint) {
      changes.reorderPoint = { from: existingStock.reorderPoint, to: reorderPoint };
    }
    if (defaultWithdrawalQty !== undefined && defaultWithdrawalQty !== existingStock.defaultWithdrawalQty) {
      changes.defaultWithdrawalQty = { from: existingStock.defaultWithdrawalQty, to: defaultWithdrawalQty };
    }

    // Update stock
    const updatedStock = await prisma.stock.update({
      where: { id: stockId },
      data: {
        location: location !== undefined ? location : existingStock.location,
        minStockLevel: minStockLevel !== undefined ? minStockLevel : existingStock.minStockLevel,
        maxStockLevel: maxStockLevel !== undefined ? maxStockLevel : existingStock.maxStockLevel,
        reorderPoint: reorderPoint !== undefined ? reorderPoint : existingStock.reorderPoint,
        defaultWithdrawalQty: defaultWithdrawalQty !== undefined ? defaultWithdrawalQty : existingStock.defaultWithdrawalQty,
        updatedBy: user.userId,
        updatedBySnapshot: userSnapshot,
      },
      include: {
        product: true,
        stockBatches: {
          where: { isActive: true },
          orderBy: { expiryDate: 'asc' },
        },
      },
    });

    // Create audit log if there are changes
    if (Object.keys(changes).length > 0) {
      const { ipAddress, userAgent } = getRequestMetadata(request);

      await createAuditLog({
        organizationId: access.organizationId,
        userId: user.userId,
        userSnapshot,
        departmentId: department.id,
        action: 'stocks.update_config',
        category: 'STOCK',
        severity: 'INFO',
        description: `แก้ไขการตั้งค่าสต็อก ${existingStock.product.name} (${existingStock.product.code})`,
        resourceId: stockId,
        resourceType: 'Stock',
        payload: {
          productCode: existingStock.product.code,
          productName: existingStock.product.name,
          departmentName: department.name,
          changes,
        },
        ipAddress,
        userAgent,
      });
    }

    // Calculate aggregated quantities
    const batches = updatedStock.stockBatches;
    const totalQuantity = batches.reduce((sum, b) => sum + b.totalQuantity, 0);
    const availableQuantity = batches.reduce((sum, b) => sum + b.availableQuantity, 0);
    const reservedQuantity = batches.reduce((sum, b) => sum + b.reservedQuantity, 0);
    const incomingQuantity = batches.reduce((sum, b) => sum + b.incomingQuantity, 0);

    return NextResponse.json({
      success: true,
      data: {
        ...updatedStock,
        totalQuantity,
        availableQuantity,
        reservedQuantity,
        incomingQuantity,
      },
      message: 'Stock configuration updated successfully',
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { error: 'Failed to update stock' },
      { status: 500 }
    );
  }
}

// ===== DELETE: Delete stock (only if no batches exist) =====
export async function DELETE(
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

    // Check permissions - only ADMIN and OWNER can delete
    if (!['ADMIN', 'OWNER'].includes(access.role)) {
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

    // Get stock
    const stock = await prisma.stock.findFirst({
      where: {
        id: stockId,
        departmentId: department.id,
        organizationId: access.organizationId,
      },
      include: {
        product: true,
        stockBatches: true,
      },
    });

    if (!stock) {
      return NextResponse.json(
        { error: 'Stock not found' },
        { status: 404 }
      );
    }

    // Check if stock has batches
    if (stock.stockBatches.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete stock with existing batches',
          details: `Stock has ${stock.stockBatches.length} batch(es)`,
        },
        { status: 409 }
      );
    }

    // Create user snapshot
    const userSnapshot = await createUserSnapshot(user.userId, access.organizationId);

    // Delete stock
    await prisma.stock.delete({
      where: { id: stockId },
    });

    // Create audit log
    const { ipAddress, userAgent } = getRequestMetadata(request);

    await createAuditLog({
      organizationId: access.organizationId,
      userId: user.userId,
      userSnapshot,
      departmentId: department.id,
      action: 'stocks.delete',
      category: 'STOCK',
      severity: 'WARNING',
      description: `ลบสต็อกสินค้า ${stock.product.name} (${stock.product.code}) ออกจากหน่วยงาน ${department.name}`,
      resourceId: stockId,
      resourceType: 'Stock',
      payload: {
        productCode: stock.product.code,
        productName: stock.product.name,
        departmentName: department.name,
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: 'Stock deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting stock:', error);
    return NextResponse.json(
      { error: 'Failed to delete stock' },
      { status: 500 }
    );
  }
}