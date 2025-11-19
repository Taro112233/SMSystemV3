// app/api/[orgSlug]/[deptSlug]/stocks/[stockId]/batches/route.ts
// Batch Management API - Add and list batches for a stock

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { createAuditLog, getRequestMetadata } from '@/lib/audit-logger';
import { createUserSnapshot } from '@/lib/user-snapshot';

// GET - List all batches for a stock
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

    // Get stock
    const stock = await prisma.stock.findFirst({
      where: {
        id: stockId,
        departmentId: department.id,
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

    // Get batches
    const batches = await prisma.stockBatch.findMany({
      where: {
        stockId,
        isActive: true,
      },
      orderBy: [
        { expiryDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: batches,
      stock: {
        id: stock.id,
        product: stock.product,
        location: stock.location,
      },
    });
  } catch (error) {
    console.error('Get batches failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add new batch
export async function POST(
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

    // Get stock
    const stock = await prisma.stock.findFirst({
      where: {
        id: stockId,
        departmentId: department.id,
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
    } = body;

    // Validation
    if (!lotNumber || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Lot number and quantity are required' },
        { status: 400 }
      );
    }

    // Check if lot number already exists for this stock
    const existingBatch = await prisma.stockBatch.findUnique({
      where: {
        stockId_lotNumber: {
          stockId,
          lotNumber: lotNumber.trim(),
        },
      },
    });

    if (existingBatch) {
      return NextResponse.json(
        { error: 'Lot number already exists for this stock' },
        { status: 409 }
      );
    }

    // Create user snapshot
    const userSnapshot = await createUserSnapshot(user.userId, access.organizationId);

    // Create batch
    const batch = await prisma.stockBatch.create({
      data: {
        stockId,
        lotNumber: lotNumber.trim(),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        manufactureDate: manufactureDate ? new Date(manufactureDate) : null,
        supplier: supplier?.trim() || null,
        costPrice: costPrice || null,
        sellingPrice: sellingPrice || null,
        totalQuantity: quantity,
        availableQuantity: quantity,
        reservedQuantity: 0,
        incomingQuantity: 0,
        location: location?.trim() || stock.location || null,
        status: 'AVAILABLE',
        isActive: true,
        createdBy: user.userId,
        createdBySnapshot: userSnapshot,
      },
    });

    // Update stock lastMovement
    await prisma.stock.update({
      where: { id: stockId },
      data: {
        lastMovement: new Date(),
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
      action: 'stocks.batch_add',
      category: 'STOCK',
      severity: 'INFO',
      description: `เพิ่ม Batch ${lotNumber} สินค้า ${stock.product.name} จำนวน ${quantity} ${stock.product.baseUnit}`,
      resourceId: batch.id,
      resourceType: 'StockBatch',
      payload: {
        productCode: stock.product.code,
        productName: stock.product.name,
        lotNumber,
        quantity,
        expiryDate,
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      data: batch,
      message: 'Batch added successfully',
    });
  } catch (error) {
    console.error('Add batch failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}