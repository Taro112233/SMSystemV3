// app/api/[orgSlug]/product-categories/[categoryId]/route.ts
// Product Attribute Categories API - Get, Update, Delete (FIXED)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { createAuditLog, getRequestMetadata } from '@/lib/audit-logger';
import { createUserSnapshot } from '@/lib/user-snapshot';

// GET - Get specific category
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

// PATCH - Update category
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

    // Check key conflict if changed
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

    // ✅ Create updater snapshot
    const userSnapshot = await createUserSnapshot(user.userId, access.organizationId);

    // ✅ FIXED: Convert displayOrder to Int
    const displayOrderInt = displayOrder !== undefined 
      ? (typeof displayOrder === 'string' ? parseInt(displayOrder, 10) : displayOrder)
      : existingCategory.displayOrder;

    // Update category
    const updatedCategory = await prisma.productAttributeCategory.update({
      where: {
        id: categoryId,
      },
      data: {
        key: key || existingCategory.key,
        label,
        description: description ?? existingCategory.description,
        options: options || existingCategory.options,
        displayOrder: displayOrderInt, // ✅ Use Int value
        isRequired: isRequired ?? existingCategory.isRequired,
        isActive: isActive ?? existingCategory.isActive,
        updatedBy: user.userId,
        updatedBySnapshot: userSnapshot,
      },
    });

    // ✅ Audit log
    const { ipAddress, userAgent } = getRequestMetadata(request);
    
    await createAuditLog({
      organizationId: access.organizationId,
      userId: user.userId,
      userSnapshot,
      action: 'product_categories.update',
      category: 'PRODUCT',
      severity: 'INFO',
      description: `แก้ไขหมวดหมู่สินค้า ${updatedCategory.label}`,
      resourceId: categoryId,
      resourceType: 'ProductAttributeCategory',
      payload: {
        before: {
          label: existingCategory.label,
          key: existingCategory.key,
          optionsCount: (existingCategory.options as string[]).length,
          isActive: existingCategory.isActive,
        },
        after: {
          label: updatedCategory.label,
          key: updatedCategory.key,
          optionsCount: (updatedCategory.options as string[]).length,
          isActive: updatedCategory.isActive,
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

// DELETE - Delete category
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
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // ✅ Create deleter snapshot
    const userSnapshot = await createUserSnapshot(user.userId, access.organizationId);

    await prisma.productAttributeCategory.delete({
      where: {
        id: categoryId,
      },
    });

    // ✅ Audit log
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