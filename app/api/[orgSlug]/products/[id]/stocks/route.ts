// app/api/[orgSlug]/products/[id]/stocks/route.ts
// Get stock summary for a product across all departments

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; id: string }> }
) {
  try {
    const { orgSlug, id } = await params;

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

    // Get product with stocks across all departments
    const product = await prisma.product.findFirst({
      where: {
        id: id,
        organizationId: access.organizationId,
      },
      select: {
        id: true,
        code: true,
        name: true,
        baseUnit: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get all stocks for this product with batches
    const stocks = await prisma.stock.findMany({
      where: {
        productId: id,
        organizationId: access.organizationId,
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        stockBatches: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            lotNumber: true,
            expiryDate: true,
            manufactureDate: true,
            supplier: true,
            costPrice: true,
            sellingPrice: true,
            totalQuantity: true,
            availableQuantity: true,
            reservedQuantity: true,
            incomingQuantity: true,
            location: true,
            status: true,
            receivedAt: true,
          },
          orderBy: [
            { expiryDate: 'asc' },
            { receivedAt: 'desc' },
          ],
        },
      },
      orderBy: {
        department: {
          name: 'asc',
        },
      },
    });

    // Transform to frontend format
    const departmentStocks = stocks.map((stock) => ({
      departmentId: stock.department.id,
      departmentName: stock.department.name,
      departmentSlug: stock.department.slug,
      totalQuantity: stock.stockBatches.reduce(
        (sum, batch) => sum + batch.totalQuantity,
        0
      ),
      availableQuantity: stock.stockBatches.reduce(
        (sum, batch) => sum + batch.availableQuantity,
        0
      ),
      batches: stock.stockBatches.map((batch) => ({
        id: batch.id,
        lotNumber: batch.lotNumber,
        expiryDate: batch.expiryDate,
        manufactureDate: batch.manufactureDate,
        supplier: batch.supplier,
        costPrice: batch.costPrice ? Number(batch.costPrice) : null,
        sellingPrice: batch.sellingPrice ? Number(batch.sellingPrice) : null,
        quantity: batch.totalQuantity,
        availableQuantity: batch.availableQuantity,
        reservedQuantity: batch.reservedQuantity,
        incomingQuantity: batch.incomingQuantity,
        location: batch.location,
        status: batch.status,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: {
        product,
        departments: departmentStocks,
      },
    });
  } catch (error) {
    console.error('Error fetching product stocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product stocks' },
      { status: 500 }
    );
  }
}