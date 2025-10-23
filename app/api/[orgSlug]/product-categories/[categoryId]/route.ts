// app/api/[orgSlug]/product-categories/[categoryId]/route.ts
// Product Attribute Categories API - SAFE UPDATE STRATEGY
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

// PATCH - Update category and options (SAFE UPDATE STRATEGY)
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
        options: {
          orderBy: { sortOrder: 'asc' }
        }
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

    // ✅ SAFE UPDATE: Update category and options
    const updatedCategory = await prisma.$transaction(async (tx) => {
      // Update category basic info
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

      // ✅ SAFE UPDATE OPTIONS (if provided)
      if (options && Array.isArray(options)) {
        const newOptions = options.map((val: string) => val.trim());
        const existingOptions = existingCategory.options;

        // Strategy: Update existing options by index, create new ones
        for (let i = 0; i < newOptions.length; i++) {
          const newValue = newOptions[i];
          const existingOption = existingOptions[i];

          if (existingOption) {
            // ✅ Update existing option (สินค้าที่ใช้งานจะยังอ้างอิงถูกต้อง)
            await tx.productAttributeOption.update({
              where: { id: existingOption.id },
              data: {
                value: newValue,
                label: newValue, // sync label with value
                sortOrder: i,
                isActive: true,
              },
            });
          } else {
            // ✅ Create new option (ถ้ามี options เพิ่มมากกว่าเดิม)
            await tx.productAttributeOption.create({
              data: {
                categoryId,
                value: newValue,
                label: newValue,
                sortOrder: i,
                isActive: true,
              },
            });
          }
        }

        // ✅ Soft delete unused options (ถ้า options ใหม่น้อยกว่าเดิม)
        if (newOptions.length < existingOptions.length) {
          const unusedOptionIds = existingOptions
            .slice(newOptions.length)
            .map(opt => opt.id);

          // Check if any unused options are being used by products
          const usedOptions = await tx.productAttribute.findMany({
            where: {
              optionId: { in: unusedOptionIds }
            },
            select: { optionId: true }
          });

          const usedOptionIds = new Set(usedOptions.map(pa => pa.optionId));

          // Soft delete unused options that are NOT being used
          const safeToDeleteIds = unusedOptionIds.filter(id => !usedOptionIds.has(id));
          
          if (safeToDeleteIds.length > 0) {
            await tx.productAttributeOption.updateMany({
              where: { id: { in: safeToDeleteIds } },
              data: { isActive: false },
            });
          }

          // If some options are still being used, keep them active
          // (สินค้าที่ใช้ options เหล่านี้จะยังใช้งานได้ตามปกติ)
        }
      }

      // Return with updated options
      return await tx.productAttributeCategory.findUnique({
        where: { id: categoryId },
        include: { 
          options: { 
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' } 
          } 
        }
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

// DELETE - Delete category (ห้ามลบถ้ามีสินค้าใช้งาน)
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
        options: true,
        productAttributes: {
          take: 1, // ✅ Check if any products use this category
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // ✅ CRITICAL: ห้ามลบถ้ามีสินค้าใช้งาน
    if (category.productAttributes.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete category',
          message: 'มีสินค้าที่ใช้หมวดหมู่นี้อยู่ กรุณาลบหรือเปลี่ยนหมวดหมู่ของสินค้าเหล่านั้นก่อน',
          code: 'CATEGORY_IN_USE'
        },
        { status: 409 }
      );
    }

    const userSnapshot = await createUserSnapshot(user.userId, access.organizationId);

    // ✅ Safe to delete (options will cascade automatically)
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