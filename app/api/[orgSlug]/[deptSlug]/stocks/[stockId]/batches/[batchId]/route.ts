// app/api/[orgSlug]/[deptSlug]/stocks/[stockId]/batches/[batchId]/route.ts
// Single Stock Batch API - Get, Update, Delete

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { createAuditLog, getRequestMetadata } from '@/lib/audit-logger';
import { createUserSnapshot } from '@/lib/user-snapshot';

// ===== GET: Get single batch =====
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; deptSlug: string; stockId: string; batchId: string }> }
) {
  try {
    const { orgSlug, deptSlug, stockId, batchId } = await params;

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

    // Verify stock exists in this department
    const stock = await prisma.stock.findFirst({
      where: {
        id: stockId,
        departmentId: department.id,
        organizationId: access.organizationId,
      },
    });

    if (!stock) {
      return NextResponse.json(
        { error: 'Stock not found' },
        { status: 404 }
      );
    }

    // Get batch
    const batch = await prisma.stockBatch.findFirst({
      where: {
        id: batchId,
        stockId,
      },
    });

    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: batch,
    });
  } catch (error) {
    console.error('Error fetching batch:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batch' },
      { status: 500 }
    );
  }
}

// ===== PATCH: Update batch =====
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; deptSlug: string; stockId: string; batchId: string }> }
) {
  try {
    const { orgSlug, deptSlug, stockId, batchId } = await params;

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

    // Get stock with product
    const stock = await prisma.stock.findFirst({
      where: {
        id: stockId,
        departmentId: department.id,
        organizationId: access.organizationId,
      },
      include: {
        product: true,
      },
    });

    if (!stock) {
      return NextResponse.json(
        { error: 'Stock not found' },
        { status: 404 }
      );
    }

    // Get existing batch
    const existingBatch = await prisma.stockBatch.findFirst({
      where: {
        id: batchId,
        stockId,
      },
    });

    if (!existingBatch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      lotNumber,
      expiryDate,
      manufactureDate,
      supplier,
      costPrice,
      sellingPrice,
      location,
      status,
      quantity,
    } = body;

    // Check lot number conflict if changed
    if (lotNumber && lotNumber !== existingBatch.lotNumber) {
      const lotConflict = await prisma.stockBatch.findFirst({
        where: {
          stockId,
          lotNumber,
          id: { not: batchId },
          isActive: true,
        },
      });

      if (lotConflict) {
        return NextResponse.json(
          { error: 'Batch with this lot number already exists' },
          { status: 409 }
        );
      }
    }

    // Create user snapshot
    const userSnapshot = await createUserSnapshot(user.userId, access.organizationId);

    // Track changes for audit
    const changes: any = {};
    if (lotNumber && lotNumber !== existingBatch.lotNumber) {
      changes.lotNumber = { from: existingBatch.lotNumber, to: lotNumber };
    }
    if (status && status !== existingBatch.status) {
      changes.status = { from: existingBatch.status, to: status };
    }
    if (quantity !== undefined && quantity !== existingBatch.totalQuantity) {
      changes.quantity = { from: existingBatch.totalQuantity, to: quantity };
    }
    if (costPrice !== undefined && costPrice !== Number(existingBatch.costPrice)) {
      changes.costPrice = { from: existingBatch.costPrice, to: costPrice };
    }

    // Calculate new available quantity if total quantity changes
    let newAvailableQuantity = existingBatch.availableQuantity;
    if (quantity !== undefined) {
      const quantityDiff = quantity - existingBatch.totalQuantity;
      newAvailableQuantity = existingBatch.availableQuantity + quantityDiff;
      
      // Ensure available quantity doesn't go negative
      if (newAvailableQuantity < 0) {
        return NextResponse.json(
          { error: 'Cannot reduce quantity below reserved amount' },
          { status: 400 }
        );
      }
    }

    // Update batch
    const updatedBatch = await prisma.stockBatch.update({
      where: { id: batchId },
      data: {
        lotNumber: lotNumber !== undefined ? lotNumber : existingBatch.lotNumber,
        expiryDate: expiryDate !== undefined ? (expiryDate ? new Date(expiryDate) : null) : existingBatch.expiryDate,
        manufactureDate: manufactureDate !== undefined ? (manufactureDate ? new Date(manufactureDate) : null) : existingBatch.manufactureDate,
        supplier: supplier !== undefined ? supplier : existingBatch.supplier,
        costPrice: costPrice !== undefined ? (costPrice ? parseFloat(costPrice.toString()) : null) : existingBatch.costPrice,
        sellingPrice: sellingPrice !== undefined ? (sellingPrice ? parseFloat(sellingPrice.toString()) : null) : existingBatch.sellingPrice,
        location: location !== undefined ? location : existingBatch.location,
        status: status !== undefined ? status : existingBatch.status,
        totalQuantity: quantity !== undefined ? quantity : existingBatch.totalQuantity,
        availableQuantity: quantity !== undefined ? newAvailableQuantity : existingBatch.availableQuantity,
        updatedBy: user.userId,
        updatedBySnapshot: userSnapshot,
      },
    });

    // Update stock lastMovement
    await prisma.stock.update({
      where: { id: stockId },
      data: { lastMovement: new Date() },
    });

    // Create audit log if there are changes
    if (Object.keys(changes).length > 0) {
      const { ipAddress, userAgent } = getRequestMetadata(request);

      await createAuditLog({
        organizationId: access.organizationId,
        userId: user.userId,
        userSnapshot,
        departmentId: department.id,
        action: 'stocks.batch_update',
        category: 'STOCK',
        severity: 'INFO',
        description: `แก้ไข Batch ${existingBatch.lotNumber} สินค้า ${stock.product.name}`,
        resourceId: batchId,
        resourceType: 'StockBatch',
        payload: {
          productCode: stock.product.code,
          productName: stock.product.name,
          departmentName: department.name,
          lotNumber: existingBatch.lotNumber,
          changes,
        },
        ipAddress,
        userAgent,
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedBatch,
      message: 'Batch updated successfully',
    });
  } catch (error) {
    console.error('Error updating batch:', error);
    return NextResponse.json(
      { error: 'Failed to update batch' },
      { status: 500 }
    );
  }
}

// ===== DELETE: Delete batch (soft delete) =====
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; deptSlug: string; stockId: string; batchId: string }> }
) {
  try {
    const { orgSlug, deptSlug, stockId, batchId } = await params;

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

    // Get stock with product
    const stock = await prisma.stock.findFirst({
      where: {
        id: stockId,
        departmentId: department.id,
        organizationId: access.organizationId,
      },
      include: {
        product: true,
      },
    });

    if (!stock) {
      return NextResponse.json(
        { error: 'Stock not found' },
        { status: 404 }
      );
    }

    // Get batch
    const batch = await prisma.stockBatch.findFirst({
      where: {
        id: batchId,
        stockId,
      },
    });

    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Check if batch has reserved quantity
    if (batch.reservedQuantity > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete batch with reserved quantity',
          details: `Batch has ${batch.reservedQuantity} reserved units`,
        },
        { status: 409 }
      );
    }

    // Create user snapshot
    const userSnapshot = await createUserSnapshot(user.userId, access.organizationId);

    // Soft delete batch
    await prisma.stockBatch.update({
      where: { id: batchId },
      data: {
        isActive: false,
        updatedBy: user.userId,
        updatedBySnapshot: userSnapshot,
      },
    });

    // Update stock lastMovement
    await prisma.stock.update({
      where: { id: stockId },
      data: { lastMovement: new Date() },
    });

    // Create audit log
    const { ipAddress, userAgent } = getRequestMetadata(request);

    await createAuditLog({
      organizationId: access.organizationId,
      userId: user.userId,
      userSnapshot,
      departmentId: department.id,
      action: 'stocks.batch_delete',
      category: 'STOCK',
      severity: 'WARNING',
      description: `ลบ Batch ${batch.lotNumber} สินค้า ${stock.product.name}`,
      resourceId: batchId,
      resourceType: 'StockBatch',
      payload: {
        productCode: stock.product.code,
        productName: stock.product.name,
        departmentName: department.name,
        lotNumber: batch.lotNumber,
        quantity: batch.totalQuantity,
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: 'Batch deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting batch:', error);
    return NextResponse.json(
      { error: 'Failed to delete batch' },
      { status: 500 }
    );
  }
}