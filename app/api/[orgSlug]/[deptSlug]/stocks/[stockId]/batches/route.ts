// app/api/[orgSlug]/[deptSlug]/stocks/[stockId]/batches/route.ts
// Stock Batches API - List and Create

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { createAuditLog, getRequestMetadata } from '@/lib/audit-logger';
import { createUserSnapshot } from '@/lib/user-snapshot';

// ===== GET: List all batches for a stock =====
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

    // Get all batches
    const batches = await prisma.stockBatch.findMany({
      where: {
        stockId,
        isActive: true,
      },
      orderBy: [
        { expiryDate: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: batches,
    });
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batches' },
      { status: 500 }
    );
  }
}

// ===== POST: Create new batch =====
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
        { error: 'Lot number and valid quantity are required' },
        { status: 400 }
      );
    }

    // Check for duplicate lot number in same stock
    const existingBatch = await prisma.stockBatch.findFirst({
      where: {
        stockId,
        lotNumber,
        isActive: true,
      },
    });

    if (existingBatch) {
      return NextResponse.json(
        { error: 'Batch with this lot number already exists' },
        { status: 409 }
      );
    }

    // Create user snapshot
    const userSnapshot = await createUserSnapshot(user.userId, access.organizationId);

    // Create batch
    const batch = await prisma.stockBatch.create({
      data: {
        stockId,
        lotNumber,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        manufactureDate: manufactureDate ? new Date(manufactureDate) : null,
        supplier: supplier || null,
        costPrice: costPrice ? parseFloat(costPrice.toString()) : null,
        sellingPrice: sellingPrice ? parseFloat(sellingPrice.toString()) : null,
        totalQuantity: quantity,
        availableQuantity: quantity,
        reservedQuantity: 0,
        incomingQuantity: 0,
        location: location || stock.location || null,
        status: 'AVAILABLE',
        isActive: true,
        createdBy: user.userId,
        createdBySnapshot: userSnapshot,
        receivedAt: new Date(),
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
      action: 'stocks.batch_create',
      category: 'STOCK',
      severity: 'INFO',
      description: `เพิ่ม Batch ${lotNumber} สินค้า ${stock.product.name} จำนวน ${quantity} ${stock.product.baseUnit}`,
      resourceId: batch.id,
      resourceType: 'StockBatch',
      payload: {
        productCode: stock.product.code,
        productName: stock.product.name,
        departmentName: department.name,
        lotNumber,
        quantity,
        expiryDate,
        costPrice,
        sellingPrice,
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      data: batch,
      message: 'Batch created successfully',
    });
  } catch (error) {
    console.error('Error creating batch:', error);
    return NextResponse.json(
      { error: 'Failed to create batch' },
      { status: 500 }
    );
  }
}