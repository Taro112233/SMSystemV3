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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const showLowStock = searchParams.get('showLowStock') === 'true';
    const showExpiring = searchParams.get('showExpiring') === 'true';
    const sortBy = searchParams.get('sortBy') || 'productName';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Build where clause for stocks
    const where: Prisma.StockWhereInput = {
      departmentId: department.id,
      organizationId: access.organizationId,
    };

    // Search filter
    if (search) {
      where.product = {
        OR: [
          { code: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { genericName: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    // Fetch stocks with product and batches
    const stocks = await prisma.stock.findMany({
      where,
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

    // Calculate aggregated quantities and apply filters
    const stocksWithQuantities = stocks.map((stock) => {
      const batches = stock.stockBatches;
      
      const totalQuantity = batches.reduce((sum, b) => sum + b.totalQuantity, 0);
      const availableQuantity = batches.reduce((sum, b) => sum + b.availableQuantity, 0);
      const reservedQuantity = batches.reduce((sum, b) => sum + b.reservedQuantity, 0);
      const incomingQuantity = batches.reduce((sum, b) => sum + b.incomingQuantity, 0);

      return {
        ...stock,
        totalQuantity,
        availableQuantity,
        reservedQuantity,
        incomingQuantity,
        batches,
      };
    });

    // Apply filters
    let filteredStocks = stocksWithQuantities;

    // Low stock filter
    if (showLowStock) {
      filteredStocks = filteredStocks.filter((stock) => {
        if (!stock.minStockLevel) return false;
        return stock.availableQuantity < stock.minStockLevel;
      });
    }

    // Expiring soon filter (within 90 days)
    if (showExpiring) {
      const ninetyDaysFromNow = new Date();
      ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

      filteredStocks = filteredStocks.filter((stock) => {
        return stock.batches.some((batch) => {
          if (!batch.expiryDate) return false;
          const expiryDate = new Date(batch.expiryDate);
          return expiryDate <= ninetyDaysFromNow && batch.status === 'AVAILABLE';
        });
      });
    }

    // Sort stocks with proper typing
    filteredStocks.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'productCode':
          aValue = a.product.code;
          bValue = b.product.code;
          break;
        case 'productName':
          aValue = a.product.name;
          bValue = b.product.name;
          break;
        case 'quantity':
          aValue = a.availableQuantity;
          bValue = b.availableQuantity;
          break;
        case 'expiryDate':
          const aNearestBatch = a.batches
            .filter((b) => b.expiryDate && b.status === 'AVAILABLE')
            .sort((x, y) => new Date(x.expiryDate!).getTime() - new Date(y.expiryDate!).getTime())[0];
          const bNearestBatch = b.batches
            .filter((b) => b.expiryDate && b.status === 'AVAILABLE')
            .sort((x, y) => new Date(x.expiryDate!).getTime() - new Date(y.expiryDate!).getTime())[0];
          aValue = aNearestBatch?.expiryDate ? new Date(aNearestBatch.expiryDate).getTime() : Infinity;
          bValue = bNearestBatch?.expiryDate ? new Date(bNearestBatch.expiryDate).getTime() : Infinity;
          break;
        default:
          aValue = a.product.name;
          bValue = b.product.name;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue, 'th');
        return sortOrder === 'asc' ? comparison : -comparison;
      } else {
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sortOrder === 'asc' ? comparison : -comparison;
      }
    });

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
    console.error('Error fetching stocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stocks' },
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