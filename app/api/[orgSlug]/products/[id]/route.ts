// app/api/[orgSlug]/products/[id]/route.ts
// UPDATED: Fix params await + role check + type-safe

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { createAuditLog, getRequestMetadata } from '@/lib/audit-logger';
import { createUserSnapshot } from '@/lib/user-snapshot';

interface ProductAttribute {
  categoryId: string;
  optionId: string;
}

interface UpdateProductRequest {
  code?: string;
  name?: string;
  genericName?: string;
  description?: string;
  baseUnit?: string;
  isActive?: boolean;
  attributes?: ProductAttribute[];
}

interface ProductChanges {
  code?: { from: string; to: string };
  name?: { from: string; to: string };
  genericName?: { from: string | null; to: string | null };
  baseUnit?: { from: string; to: string };
  isActive?: { from: boolean; to: boolean };
  attributes?: { from: number; to: number };
}

// ===== GET: Get single product =====
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

    const product = await prisma.product.findFirst({
      where: {
        id: id,
        organizationId: access.organizationId,
      },
      include: {
        attributes: {
          include: {
            category: true,
            option: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// ===== PATCH: Update product =====
export async function PATCH(
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

    if (!['ADMIN', 'OWNER'].includes(access.role)) {
      return NextResponse.json(
        { 
          error: 'Insufficient permissions. ADMIN or OWNER required.',
          userRole: access.role 
        },
        { status: 403 }
      );
    }

    const existingProduct = await prisma.product.findFirst({
      where: {
        id: id,
        organizationId: access.organizationId,
      },
      include: {
        attributes: {
          include: {
            category: true,
            option: true,
          },
        },
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const body: UpdateProductRequest = await request.json();
    const {
      code,
      name,
      genericName,
      description,
      baseUnit,
      isActive,
      attributes,
    } = body;

    // Check code conflict
    if (code && code !== existingProduct.code) {
      const codeConflict = await prisma.product.findFirst({
        where: {
          organizationId: access.organizationId,
          code,
          id: { not: id },
        },
      });

      if (codeConflict) {
        return NextResponse.json(
          { error: 'Product with this code already exists' },
          { status: 409 }
        );
      }
    }

    // Create user snapshot
    const userSnapshot = await createUserSnapshot(user.userId, access.organizationId);

    // Track changes for audit
    const changes: ProductChanges = {};
    if (code && code !== existingProduct.code) changes.code = { from: existingProduct.code, to: code };
    if (name && name !== existingProduct.name) changes.name = { from: existingProduct.name, to: name };
    if (genericName !== undefined && genericName !== existingProduct.genericName) {
      changes.genericName = { from: existingProduct.genericName, to: genericName };
    }
    if (baseUnit && baseUnit !== existingProduct.baseUnit) {
      changes.baseUnit = { from: existingProduct.baseUnit, to: baseUnit };
    }
    if (isActive !== undefined && isActive !== existingProduct.isActive) {
      changes.isActive = { from: existingProduct.isActive, to: isActive };
    }

    // Update product with attributes using transaction
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Update product
      const updated = await tx.product.update({
        where: { id: id },
        data: {
          code: code || existingProduct.code,
          name: name || existingProduct.name,
          genericName: genericName !== undefined ? genericName : existingProduct.genericName,
          description: description !== undefined ? description : existingProduct.description,
          baseUnit: baseUnit || existingProduct.baseUnit,
          isActive: isActive !== undefined ? isActive : existingProduct.isActive,
          updatedBy: user.userId,
          updatedBySnapshot: userSnapshot,
        },
      });

      // Update attributes if provided
      if (attributes !== undefined) {
        // Delete existing attributes
        await tx.productAttribute.deleteMany({
          where: { productId: id },
        });

        // Create new attributes
        if (attributes.length > 0) {
          await tx.productAttribute.createMany({
            data: attributes.map((attr) => ({
              productId: id,
              categoryId: attr.categoryId,
              optionId: attr.optionId,
            })),
          });
        }

        changes.attributes = {
          from: existingProduct.attributes.length,
          to: attributes.length,
        };
      }

      return updated;
    });

    // Get request metadata
    const { ipAddress, userAgent } = getRequestMetadata(request);

    // Create audit log if there are changes
    if (Object.keys(changes).length > 0) {
      await createAuditLog({
        organizationId: access.organizationId,
        userId: user.userId,
        userSnapshot,
        action: 'products.update',
        category: 'PRODUCT',
        severity: 'INFO',
        description: `แก้ไขสินค้า ${updatedProduct.name} (${updatedProduct.code})`,
        resourceId: updatedProduct.id,
        resourceType: 'Product',
        payload: {
          productCode: updatedProduct.code,
          productName: updatedProduct.name,
          changes: JSON.parse(JSON.stringify(changes)),
        },
        ipAddress,
        userAgent,
      });
    }

    // Fetch complete product with attributes
    const completeProduct = await prisma.product.findUnique({
      where: { id: id },
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
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// ===== PUT: Toggle isActive status =====
export async function PUT(
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

    if (!['ADMIN', 'OWNER'].includes(access.role)) {
      return NextResponse.json(
        { 
          error: 'Insufficient permissions. ADMIN or OWNER required.',
          userRole: access.role 
        },
        { status: 403 }
      );
    }

    const product = await prisma.product.findFirst({
      where: {
        id: id,
        organizationId: access.organizationId,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive must be a boolean' },
        { status: 400 }
      );
    }

    // Create user snapshot
    const userSnapshot = await createUserSnapshot(user.userId, access.organizationId);

    // Update status
    const updatedProduct = await prisma.product.update({
      where: { id: id },
      data: {
        isActive,
        updatedBy: user.userId,
        updatedBySnapshot: userSnapshot,
      },
    });

    // Get request metadata
    const { ipAddress, userAgent } = getRequestMetadata(request);

    // Create audit log
    await createAuditLog({
      organizationId: access.organizationId,
      userId: user.userId,
      userSnapshot,
      action: 'products.toggle_status',
      category: 'PRODUCT',
      severity: 'INFO',
      description: `${isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}สินค้า ${product.name} (${product.code})`,
      resourceId: product.id,
      resourceType: 'Product',
      payload: {
        productCode: product.code,
        productName: product.name,
        previousStatus: product.isActive,
        newStatus: isActive,
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    console.error('Error toggling product status:', error);
    return NextResponse.json(
      { error: 'Failed to toggle product status' },
      { status: 500 }
    );
  }
}

// ===== DELETE: Delete product =====
export async function DELETE(
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

    if (!['ADMIN', 'OWNER'].includes(access.role)) {
      return NextResponse.json(
        { 
          error: 'Insufficient permissions. ADMIN or OWNER required.',
          userRole: access.role 
        },
        { status: 403 }
      );
    }

    const product = await prisma.product.findFirst({
      where: {
        id: id,
        organizationId: access.organizationId,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if product has stocks
    const stockCount = await prisma.stock.count({
      where: { productId: id },
    });

    if (stockCount > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete product with existing stocks',
          details: `Product has ${stockCount} stock records`,
        },
        { status: 409 }
      );
    }

    // Create user snapshot
    const userSnapshot = await createUserSnapshot(user.userId, access.organizationId);

    // Delete product (cascade will delete attributes)
    await prisma.product.delete({
      where: { id: id },
    });

    // Get request metadata
    const { ipAddress, userAgent } = getRequestMetadata(request);

    // Create audit log
    await createAuditLog({
      organizationId: access.organizationId,
      userId: user.userId,
      userSnapshot,
      action: 'products.delete',
      category: 'PRODUCT',
      severity: 'WARNING',
      description: `ลบสินค้า ${product.name} (${product.code})`,
      resourceId: product.id,
      resourceType: 'Product',
      payload: {
        productCode: product.code,
        productName: product.name,
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}