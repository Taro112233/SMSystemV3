// app/api/[orgSlug]/[deptSlug]/stocks/[stockId]/batches/[batchId]/route.ts
// Individual Batch API - Update batch details and status

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { createAuditLog, getRequestMetadata } from '@/lib/audit-logger';
import { createUserSnapshot } from '@/lib/user-snapshot';
import { Prisma } from '@prisma/client';

// GET - Get specific batch
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

    // Get batch with stock and product info
    const batch = await prisma.stockBatch.findFirst({
      where: {
        id: batchId,
        stockId,
        stock: {
          departmentId: department.id,
        },
      },
      include: {
        stock: {
          include: {
            product: true,
          },
        },
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
    console.error('Get batch failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update batch
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

    // Get existing batch
    const existingBatch = await prisma.stockBatch.findFirst({
      where: {
        id: batchId,
        stockId,
        stock: {
          departmentId: department.id,
        },
      },
      include: {
        stock: {
          include: {
            product: true,
          },
        },
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
      quantity,
      location,
      status,
    } = body;

    // Build update data with proper typing
    const updateData: Prisma.StockBatchUpdateInput = {};

    if (lotNumber !== undefined && lotNumber.trim() !== existingBatch.lotNumber) {
      // Check if new lot number already exists
      const duplicateLot = await prisma.stockBatch.findFirst({
        where: {
          stockId,
          lotNumber: lotNumber.trim(),
          id: { not: batchId },
        },
      });

      if (duplicateLot) {
        return NextResponse.json(
          { error: 'Lot number already exists for this stock' },
          { status: 409 }
        );
      }

      updateData.lotNumber = lotNumber.trim();
    }

    if (expiryDate !== undefined) {
      updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;
    }

    if (manufactureDate !== undefined) {
      updateData.manufactureDate = manufactureDate ? new Date(manufactureDate) : null;
    }

    if (supplier !== undefined) {
      updateData.supplier = supplier?.trim() || null;
    }

    if (costPrice !== undefined) {
      updateData.costPrice = costPrice || null;
    }

    if (sellingPrice !== undefined) {
      updateData.sellingPrice = sellingPrice || null;
    }

    if (quantity !== undefined && quantity > 0) {
      // Calculate quantity difference
      const diff = quantity - existingBatch.totalQuantity;
      updateData.totalQuantity = quantity;
      updateData.availableQuantity = existingBatch.availableQuantity + diff;
    }

    if (location !== undefined) {
      updateData.location = location?.trim() || null;
    }

    if (status !== undefined && ['AVAILABLE', 'RESERVED', 'QUARANTINE', 'DAMAGED', 'EXPIRED'].includes(status)) {
      updateData.status = status;
    }

    // Create user snapshot
    const userSnapshot = await createUserSnapshot(user.userId, access.organizationId);
    updateData.updatedBy = user.userId;
    updateData.updatedBySnapshot = userSnapshot as Prisma.InputJsonValue;

    // Update batch
    const updatedBatch = await prisma.stockBatch.update({
      where: { id: batchId },
      data: updateData,
    });

    // Update stock lastMovement
    await prisma.stock.update({
      where: { id: stockId },
      data: {
        lastMovement: new Date(),
        updatedBy: user.userId,
        updatedBySnapshot: userSnapshot as Prisma.InputJsonValue,
      },
    });

    // Audit log
    const { ipAddress, userAgent } = getRequestMetadata(request);
    await createAuditLog({
      organizationId: access.organizationId,
      userId: user.userId,
      userSnapshot,
      departmentId: department.id,
      action: 'stocks.batch_update',
      category: 'STOCK',
      severity: 'INFO',
      description: `แก้ไข Batch ${existingBatch.lotNumber} สินค้า ${existingBatch.stock.product.name}`,
      resourceId: batchId,
      resourceType: 'StockBatch',
      payload: {
        before: {
          lotNumber: existingBatch.lotNumber,
          quantity: existingBatch.totalQuantity,
          status: existingBatch.status,
        },
        after: updateData,
      } as Prisma.InputJsonValue,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      data: updatedBatch,
      message: 'Batch updated successfully',
    });
  } catch (error) {
    console.error('Update batch failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete batch
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

    // Check permissions (only ADMIN/OWNER can delete)
    if (!['ADMIN', 'OWNER'].includes(access.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. ADMIN or OWNER required.' },
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

    // Get batch
    const batch = await prisma.stockBatch.findFirst({
      where: {
        id: batchId,
        stockId,
        stock: {
          departmentId: department.id,
        },
      },
      include: {
        stock: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Check if batch has reserved or incoming quantity
    if (batch.reservedQuantity > 0 || batch.incomingQuantity > 0) {
      return NextResponse.json(
        { error: 'Cannot delete batch with reserved or incoming quantity' },
        { status: 400 }
      );
    }

    // Soft delete
    const userSnapshot = await createUserSnapshot(user.userId, access.organizationId);
    
    await prisma.stockBatch.update({
      where: { id: batchId },
      data: {
        isActive: false,
        updatedBy: user.userId,
        updatedBySnapshot: userSnapshot as Prisma.InputJsonValue,
      },
    });

    // Audit log
    const { ipAddress, userAgent } = getRequestMetadata(request);
    await createAuditLog({
      organizationId: access.organizationId,
      userId: user.userId,
      userSnapshot,
      departmentId: department.id,
      action: 'stocks.batch_delete',
      category: 'STOCK',
      severity: 'WARNING',
      description: `ลบ Batch ${batch.lotNumber} สินค้า ${batch.stock.product.name}`,
      resourceId: batchId,
      resourceType: 'StockBatch',
      payload: {
        lotNumber: batch.lotNumber,
        quantity: batch.totalQuantity,
      } as Prisma.InputJsonValue,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: 'Batch deleted successfully',
    });
  } catch (error) {
    console.error('Delete batch failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}