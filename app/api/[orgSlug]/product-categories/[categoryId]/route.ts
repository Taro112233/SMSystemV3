// app/api/[orgSlug]/product-categories/[categoryId]/route.ts
// Product Attribute Categories API - UPDATED for relational options
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { createAuditLog, getRequestMetadata } from '@/lib/audit-logger';
import { createUserSnapshot } from '@/lib/user-snapshot';

// GET - Get specific category with options
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; categoryId: string }> }
) {
  try {
    const { orgSlug, categoryId } = await params;
    
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

    const category = await prisma.productAttributeCategory.findFirst({
      where: {
        id: categoryId,
        organizationId: access.organizationId,
      },
      include: {
        options: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error('Get category failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update category and options
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; categoryId: string }> }
) {
  try {
    const { orgSlug, categoryId } = await params;
    
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
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const existingCategory = await prisma.productAttributeCategory.findFirst({
      where: {
        id: categoryId,
        organizationId: access.organizationId,
      },
      include: {
        options: true
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { key, label, description, options, displayOrder, isRequired, isActive } = body;

    if (!label) {
      return NextResponse.json(
        { error: 'Label is required' },
        { status: 400 }
      );
    }

    if (options && (!Array.isArray(options) || options.length === 0)) {
      return NextResponse.json(
        { error: 'Options must be a non-empty array' },
        { status: 400 }
      );
    }

    // Check key conflict
    if (key && key !== existingCategory.key) {
      if (!/^[a-z0-9_]+$/.test(key)) {
        return NextResponse.json(
          { error: 'Key must contain only lowercase letters, numbers, and underscores' },
          { status: 400 }
        );
      }

      const keyConflict = await prisma.productAttributeCategory.findFirst({
        where: {
          organizationId: access.organizationId,
          key,
          id: { not: categoryId },
        },
      });

      if (keyConflict) {
        return NextResponse.json(
          { error: 'Category with this key already exists' },
          { status: 409 }
        );
      }
    }

    const userSnapshot = await createUserSnapshot(user.userId, access.organizationId);
    const displayOrderInt = displayOrder !== undefined 
      ? (typeof displayOrder === 'string' ? parseInt(displayOrder, 10) : displayOrder)
      : existingCategory.displayOrder;

    // ✅ Update category and options using transaction
    const updatedCategory = await prisma.$transaction(async (tx) => {
      // Update category
      const updated = await tx.productAttributeCategory.update({
        where: { id: categoryId },
        data: {
          key: key || existingCategory.key,
          label,
          description: description ?? existingCategory.description,
          displayOrder: displayOrderInt,
          isRequired: isRequired ?? existingCategory.isRequired,
          isActive: isActive ?? existingCategory.isActive,
          updatedBy: user.userId,
          updatedBySnapshot: userSnapshot,
        },
      });

      // ✅ Update options if provided
      if (options) {
        // Delete all existing options
        await tx.productAttributeOption.deleteMany({
          where: { categoryId }
        });

        // Create new options
        await tx.productAttributeOption.createMany({
          data: options.map((value: string, index: number) => ({
            categoryId,
            value: value.trim(),
            sortOrder: index,
            isActive: true,
          })),
        });
      }

      // Return with options
      return await tx.productAttributeCategory.findUnique({
        where: { id: categoryId },
        include: { options: { orderBy: { sortOrder: 'asc' } } }
      });
    });

    // Audit log
    const { ipAddress, userAgent } = getRequestMetadata(request);
    
    await createAuditLog({
      organizationId: access.organizationId,
      userId: user.userId,
      userSnapshot,
      action: 'product_categories.update',
      category: 'PRODUCT',
      severity: 'INFO',
      description: `แก้ไขหมวดหมู่สินค้า ${updatedCategory!.label}`,
      resourceId: categoryId,
      resourceType: 'ProductAttributeCategory',
      payload: {
        before: {
          label: existingCategory.label,
          key: existingCategory.key,
          optionsCount: existingCategory.options.length,
          isActive: existingCategory.isActive,
        },
        after: {
          label: updatedCategory!.label,
          key: updatedCategory!.key,
          optionsCount: updatedCategory!.options.length,
          isActive: updatedCategory!.isActive,
        },
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      category: updatedCategory,
      message: 'Category updated successfully',
    });
  } catch (error) {
    console.error('Update category failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete category (options cascade automatically)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; categoryId: string }> }
) {
  try {
    const { orgSlug, categoryId } = await params;
    
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
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const category = await prisma.productAttributeCategory.findFirst({
      where: {
        id: categoryId,
        organizationId: access.organizationId,
      },
      include: {
        options: true
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const userSnapshot = await createUserSnapshot(user.userId, access.organizationId);

    // ✅ Delete category (options will cascade automatically via onDelete: Cascade)
    await prisma.productAttributeCategory.delete({
      where: { id: categoryId },
    });

    // Audit log
    const { ipAddress, userAgent } = getRequestMetadata(request);
    
    await createAuditLog({
      organizationId: access.organizationId,
      userId: user.userId,
      userSnapshot,
      action: 'product_categories.delete',
      category: 'PRODUCT',
      severity: 'WARNING',
      description: `ลบหมวดหมู่สินค้า ${category.label}`,
      resourceId: categoryId,
      resourceType: 'ProductAttributeCategory',
      payload: {
        categoryKey: category.key,
        categoryLabel: category.label,
        optionsCount: category.options.length,
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Delete category failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}