// app/api/[orgSlug]/products/route.ts
// UPDATED: Support sorting by categories + type-safe

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { createAuditLog, getRequestMetadata } from '@/lib/audit-logger';
import { createUserSnapshot } from '@/lib/user-snapshot';

interface ProductAttribute {
  categoryId: string;
  optionId: string;
}

interface CreateProductRequest {
  code: string;
  name: string;
  genericName?: string;
  description?: string;
  baseUnit: string;
  isActive?: boolean;
  attributes?: ProductAttribute[];
}

// ===== GET: List all products with attributes =====
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  try {
    const { orgSlug } = await params;

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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Category filters
    const category1 = searchParams.get('category1');
    const category2 = searchParams.get('category2');
    const category3 = searchParams.get('category3');

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      organizationId: access.organizationId,
    };

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { genericName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Category filters (will filter after fetching)
    const categoryFilters: string[] = [];
    if (category1) categoryFilters.push(category1);
    if (category2) categoryFilters.push(category2);
    if (category3) categoryFilters.push(category3);

    // Build orderBy (handle category sorting)
    let orderBy: Prisma.ProductOrderByWithRelationInput = {};
    
    // Check if sorting by category (category1, category2, category3)
    if (sortBy.startsWith('category')) {
      // Will sort in-memory after fetching
      orderBy = { createdAt: sortOrder as 'asc' | 'desc' };
    } else {
      orderBy = { [sortBy]: sortOrder as 'asc' | 'desc' };
    }

    // Fetch products with attributes
    let products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        attributes: {
          include: {
            category: true,
            option: true,
          },
        },
      },
    });

    // Filter by categories if specified
    if (categoryFilters.length > 0) {
      products = products.filter(product => {
        return categoryFilters.every(optionId => 
          product.attributes.some(attr => attr.optionId === optionId)
        );
      });
    }

    // Sort by category if requested (in-memory)
    if (sortBy.startsWith('category')) {
      const categoryIndex = parseInt(sortBy.replace('category', '')) - 1;
      
      products.sort((a, b) => {
        // Get category value for each product
        const aAttr = a.attributes[categoryIndex];
        const bAttr = b.attributes[categoryIndex];
        
        const aValue = aAttr ? (aAttr.option.label || aAttr.option.value) : '';
        const bValue = bAttr ? (bAttr.option.label || bAttr.option.value) : '';
        
        const comparison = aValue.localeCompare(bValue, 'th');
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// ===== POST: Create new product =====
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  try {
    const { orgSlug } = await params;

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

    console.log('🔍 User role check:', { 
      userId: user.userId, 
      role: access.role
    });

    // Check permissions
    if (!['ADMIN', 'OWNER'].includes(access.role)) {
      return NextResponse.json(
        { 
          error: 'Insufficient permissions. ADMIN or OWNER required.',
          userRole: access.role 
        },
        { status: 403 }
      );
    }

    const body: CreateProductRequest = await request.json();
    const {
      code,
      name,
      genericName,
      description,
      baseUnit,
      isActive = true,
      attributes = [],
    } = body;

    // Validation
    if (!code || !name || !baseUnit) {
      return NextResponse.json(
        { error: 'Code, name, and baseUnit are required' },
        { status: 400 }
      );
    }

    // Check duplicate code
    const existingProduct = await prisma.product.findFirst({
      where: {
        organizationId: access.organizationId,
        code,
      },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this code already exists' },
        { status: 409 }
      );
    }

    // Create user snapshot
    const userSnapshot = await createUserSnapshot(user.userId, access.organizationId);

    // Create product with attributes using transaction
    const product = await prisma.$transaction(async (tx) => {
      // Create product
      const newProduct = await tx.product.create({
        data: {
          organizationId: access.organizationId,
          code,
          name,
          genericName: genericName || null,
          description: description || null,
          baseUnit,
          isActive,
          createdBy: user.userId,
          createdBySnapshot: userSnapshot,
        },
      });

      // Create attributes if provided
      if (attributes.length > 0) {
        await tx.productAttribute.createMany({
          data: attributes.map((attr) => ({
            productId: newProduct.id,
            categoryId: attr.categoryId,
            optionId: attr.optionId,
          })),
        });
      }

      return newProduct;
    });

    // Get request metadata
    const { ipAddress, userAgent } = getRequestMetadata(request);

    // Create audit log
    await createAuditLog({
      organizationId: access.organizationId,
      userId: user.userId,
      userSnapshot,
      action: 'products.create',
      category: 'PRODUCT',
      severity: 'INFO',
      description: `สร้างสินค้า ${product.name} (${product.code})`,
      resourceId: product.id,
      resourceType: 'Product',
      payload: {
        productCode: product.code,
        productName: product.name,
        baseUnit: product.baseUnit,
        attributesCount: attributes.length,
      },
      ipAddress,
      userAgent,
    });

    // Fetch complete product with attributes
    const completeProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        attributes: {
          include: {
            category: true,
            option: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: completeProduct,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}