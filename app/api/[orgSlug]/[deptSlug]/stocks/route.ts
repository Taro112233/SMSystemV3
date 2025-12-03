// app/api/[orgSlug]/[deptSlug]/stocks/route.ts
// Department Stocks API - List and Create

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { createAuditLog, getRequestMetadata } from '@/lib/audit-logger';
import { createUserSnapshot } from '@/lib/user-snapshot';

// ===== GET: List all stocks in department =====
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; deptSlug: string }> }
) {
  try {
    const { orgSlug, deptSlug } = await params;

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

    // Get query params
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const showLowStock = searchParams.get('showLowStock') === 'true';
    const showExpiring = searchParams.get('showExpiring') === 'true';

    // Build where clause for products
    interface ProductWhereClause {
      organizationId: string;
      isActive: boolean;
      OR?: Array<{
        code?: { contains: string; mode: 'insensitive' };
        name?: { contains: string; mode: 'insensitive' };
        genericName?: { contains: string; mode: 'insensitive' };
      }>;
    }

    const productWhere: ProductWhereClause = {
      organizationId: access.organizationId,
      isActive: true,
    };

    if (search) {
      productWhere.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { genericName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get stocks with batches
    const stocks = await prisma.stock.findMany({
      where: {
        departmentId: department.id,
        product: productWhere,
      },
      include: {
        product: {
          select: {
            id: true,
            code: true,
            name: true,
            genericName: true,
            baseUnit: true,
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
      orderBy: { product: { code: 'asc' } },
    });

    // Get incoming transfers for this department
    const incomingTransfers = await prisma.transfer.findMany({
      where: {
        organizationId: access.organizationId,
        requestingDepartmentId: department.id,
        status: {
          in: ['APPROVED', 'PREPARED'],
        },
      },
      include: {
        items: {
          where: {
            status: {
              in: ['APPROVED', 'PREPARED'],
            },
          },
          select: {
            productId: true,
            approvedQuantity: true,
            preparedQuantity: true,
          },
        },
      },
    });

    // Calculate incoming quantity per product
    const incomingByProduct = new Map<string, number>();
    incomingTransfers.forEach(transfer => {
      transfer.items.forEach(item => {
        const currentIncoming = incomingByProduct.get(item.productId) || 0;
        const itemIncoming = item.preparedQuantity || item.approvedQuantity || 0;
        incomingByProduct.set(item.productId, currentIncoming + itemIncoming);
      });
    });

    // ✅ FIXED: Map stocks with batches included
    const stocksWithQuantities = stocks.map((stock) => {
      const totalQuantity = stock.stockBatches.reduce(
        (sum, batch) => sum + batch.totalQuantity,
        0
      );
      const availableQuantity = stock.stockBatches.reduce(
        (sum, batch) => sum + batch.availableQuantity,
        0
      );
      const reservedQuantity = stock.stockBatches.reduce(
        (sum, batch) => sum + batch.reservedQuantity,
        0
      );
      
      const incomingQuantity = incomingByProduct.get(stock.productId) || 0;

      return {
        id: stock.id,
        organizationId: stock.organizationId,
        departmentId: stock.departmentId,
        productId: stock.productId,
        product: stock.product,
        location: stock.location,
        minStockLevel: stock.minStockLevel,
        maxStockLevel: stock.maxStockLevel,
        reorderPoint: stock.reorderPoint,
        defaultWithdrawalQty: stock.defaultWithdrawalQty,
        lastStockCheck: stock.lastStockCheck,
        lastMovement: stock.lastMovement,
        createdAt: stock.createdAt,
        updatedAt: stock.updatedAt,
        // ✅ Include batches in response
        batches: stock.stockBatches,
        // Calculated quantities
        totalQuantity,
        availableQuantity,
        reservedQuantity,
        incomingQuantity,
      };
    });

    // Apply filters
    let filteredStocks = stocksWithQuantities;

    if (showLowStock) {
      filteredStocks = filteredStocks.filter(
        (s) =>
          s.minStockLevel !== null &&
          s.availableQuantity < s.minStockLevel
      );
    }

    if (showExpiring) {
      const ninetyDaysFromNow = new Date();
      ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 365);

      filteredStocks = filteredStocks.filter((s) =>
        s.batches.some(
          (b) =>
            b.expiryDate &&
            b.status === 'AVAILABLE' &&
            new Date(b.expiryDate) <= ninetyDaysFromNow
        )
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredStocks,
      department: {
        id: department.id,
        name: department.name,
        slug: department.slug,
      },
    });
  } catch (error) {
    console.error('Get stocks failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ===== POST: Create new stock (initialize product in department) =====
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; deptSlug: string }> }
) {
  try {
    const { orgSlug, deptSlug } = await params;

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

    const body = await request.json();
    const {
      productId,
      location,
      minStockLevel,
      maxStockLevel,
      reorderPoint,
      defaultWithdrawalQty,
    } = body;

    // Validation
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        organizationId: access.organizationId,
        isActive: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found or inactive' },
        { status: 404 }
      );
    }

    // Check if stock already exists
    const existingStock = await prisma.stock.findUnique({
      where: {
        departmentId_productId: {
          departmentId: department.id,
          productId,
        },
      },
    });

    if (existingStock) {
      return NextResponse.json(
        { error: 'Stock for this product already exists in this department' },
        { status: 409 }
      );
    }

    // Create user snapshot
    const userSnapshot = await createUserSnapshot(user.userId, access.organizationId);

    // Create stock
    const stock = await prisma.stock.create({
      data: {
        organizationId: access.organizationId,
        departmentId: department.id,
        productId,
        location: location || null,
        minStockLevel: minStockLevel || null,
        maxStockLevel: maxStockLevel || null,
        reorderPoint: reorderPoint || null,
        defaultWithdrawalQty: defaultWithdrawalQty || null,
        createdBy: user.userId,
        createdBySnapshot: userSnapshot as Prisma.InputJsonValue,
      },
      include: {
        product: true,
        stockBatches: true,
      },
    });

    // Get request metadata
    const { ipAddress, userAgent } = getRequestMetadata(request);

    // Create audit log
    await createAuditLog({
      organizationId: access.organizationId,
      userId: user.userId,
      userSnapshot,
      departmentId: department.id,
      action: 'stocks.create',
      category: 'STOCK',
      severity: 'INFO',
      description: `เพิ่มสินค้า ${product.name} (${product.code}) เข้าสู่สต็อกหน่วยงาน ${department.name}`,
      resourceId: stock.id,
      resourceType: 'Stock',
      payload: {
        productCode: product.code,
        productName: product.name,
        departmentName: department.name,
        location,
        minStockLevel,
        maxStockLevel,
        reorderPoint,
      } as Prisma.InputJsonValue,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      data: stock,
      message: 'Stock initialized successfully',
    });
  } catch (error) {
    console.error('Error creating stock:', error);
    return NextResponse.json(
      { error: 'Failed to create stock' },
      { status: 500 }
    );
  }
}