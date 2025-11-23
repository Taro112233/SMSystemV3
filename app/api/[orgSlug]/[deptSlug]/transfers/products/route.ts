// app/api/[orgSlug]/[deptSlug]/transfers/products/route.ts
// Get products with stock info for transfer creation

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

// Type definition for stock with batches
interface StockWithBatches {
  id: string;
  productId: string;
  departmentId: string;
  defaultWithdrawalQty: number | null;
  updatedAt: Date;
  stockBatches: {
    availableQuantity: number;
  }[];
}

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

    // Get requesting department (current department)
    const requestingDept = await prisma.department.findFirst({
      where: {
        organizationId: access.organizationId,
        slug: deptSlug,
        isActive: true,
      },
    });

    if (!requestingDept) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    // Get supplying department from query
    const { searchParams } = new URL(request.url);
    const supplyingDeptSlug = searchParams.get('supplyingDept');

    let supplyingDept = null;
    if (supplyingDeptSlug) {
      supplyingDept = await prisma.department.findFirst({
        where: {
          organizationId: access.organizationId,
          slug: supplyingDeptSlug,
          isActive: true,
        },
      });
    }

    // Get all active products in organization
    const products = await prisma.product.findMany({
      where: {
        organizationId: access.organizationId,
        isActive: true,
      },
      select: {
        id: true,
        code: true,
        name: true,
        genericName: true,
        baseUnit: true,
      },
      orderBy: { code: 'asc' },
    });

    // Get stocks from requesting department
    const requestingStocks = await prisma.stock.findMany({
      where: {
        departmentId: requestingDept.id,
      },
      select: {
        id: true,
        productId: true,
        departmentId: true,
        defaultWithdrawalQty: true,
        updatedAt: true,
        stockBatches: {
          where: { 
            isActive: true,
            status: 'AVAILABLE',
          },
          select: {
            availableQuantity: true,
          },
        },
      },
    });

    // Get stocks from supplying department (if specified)
    let supplyingStocks: StockWithBatches[] = [];
    
    if (supplyingDept) {
      supplyingStocks = await prisma.stock.findMany({
        where: {
          departmentId: supplyingDept.id,
        },
        select: {
          id: true,
          productId: true,
          departmentId: true,
          defaultWithdrawalQty: true,
          updatedAt: true,
          stockBatches: {
            where: { 
              isActive: true,
              status: 'AVAILABLE',
            },
            select: {
              availableQuantity: true,
            },
          },
        },
      });
    }

    // Map products with stock info
    const productsWithStock = products.map((product) => {
      const requestingStock = requestingStocks.find(
        (s) => s.productId === product.id
      );
      const supplyingStock = supplyingStocks.find(
        (s) => s.productId === product.id
      );

      // Calculate total available quantity from all batches
      const requestingAvailable = requestingStock?.stockBatches.reduce(
        (sum: number, b: { availableQuantity: number }) => sum + b.availableQuantity,
        0
      ) || 0;

      const supplyingAvailable = supplyingStock?.stockBatches.reduce(
        (sum: number, b: { availableQuantity: number }) => sum + b.availableQuantity,
        0
      ) || 0;

      return {
        ...product,
        defaultWithdrawalQty: requestingStock?.defaultWithdrawalQty || undefined,
        requestingStock: requestingStock
          ? {
              stockId: requestingStock.id,
              availableQuantity: requestingAvailable,
              lastUpdated: requestingStock.updatedAt,
            }
          : undefined,
        supplyingStock: supplyingStock
          ? {
              stockId: supplyingStock.id,
              availableQuantity: supplyingAvailable,
              lastUpdated: supplyingStock.updatedAt,
            }
          : undefined,
      };
    });

    return NextResponse.json({
      success: true,
      data: productsWithStock,
      requestingDepartment: {
        id: requestingDept.id,
        name: requestingDept.name,
        slug: requestingDept.slug,
      },
      supplyingDepartment: supplyingDept
        ? {
            id: supplyingDept.id,
            name: supplyingDept.name,
            slug: supplyingDept.slug,
          }
        : null,
    });
  } catch (error) {
    console.error('Get products with stock failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}