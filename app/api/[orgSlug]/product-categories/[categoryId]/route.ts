// app/api/[orgSlug]/product-categories/[categoryId]/route.ts
// Product Attribute Categories API - SAFE UPDATE STRATEGY
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { createAuditLog, getRequestMetadata } from '@/lib/audit-logger';
import { createUserSnapshot } from '@/lib/user-snapshot';
import { Prisma } from '@prisma/client';

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
    
    // ✅ รับข้อมูลทั้งหมดที่ส่งมา
    const { 
      key, 
      label, 
      description,
      displayOrder,
      isRequired,
      isActive,
      options 
    } = body;

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

    // Check key conflict (only if key changed)
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

    // ✅ SAFE UPDATE: Update category and options
    const updatedCategory = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // ✅ FIXED: Parse displayOrder to number
      const parsedDisplayOrder = displayOrder !== undefined 
        ? (typeof displayOrder === 'string' ? parseInt(displayOrder, 10) : displayOrder)
        : existingCategory.displayOrder;

      await tx.productAttributeCategory.update({
        where: { id: categoryId },
        data: {
          key: key || existingCategory.key,
          label,
          description: description !== undefined ? description : existingCategory.description,
          displayOrder: parsedDisplayOrder,  // ✅ Use parsed number
          isRequired: isRequired !== undefined ? isRequired : existingCategory.isRequired,
          isActive: isActive !== undefined ? isActive : existingCategory.isActive,
          updatedBy: user.userId,
          updatedBySnapshot: userSnapshot as Prisma.InputJsonValue,
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
            // ✅ Update existing option
            await tx.productAttributeOption.update({
              where: { id: existingOption.id },
              data: {
                value: newValue,
                label: newValue,
                sortOrder: i,
                isActive: true,
              },
            });
          } else {
            // ✅ Create new option
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

        // ✅ Soft delete unused options
        if (newOptions.length < existingOptions.length) {
          const unusedOptionIds = existingOptions
            .slice(newOptions.length)
            .map((opt: { id: string }) => opt.id);

          const usedOptions = await tx.productAttribute.findMany({
            where: {
              optionId: { in: unusedOptionIds }
            },
            select: { optionId: true }
          });

          const usedOptionIds = new Set(usedOptions.map((pa: { optionId: string }) => pa.optionId));
          const safeToDeleteIds = unusedOptionIds.filter((id: string) => !usedOptionIds.has(id));
          
          if (safeToDeleteIds.length > 0) {
            await tx.productAttributeOption.updateMany({
              where: { id: { in: safeToDeleteIds } },
              data: { isActive: false },
            });
          }
        }
      }

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

    // ✅ Audit log with all changes
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
          description: existingCategory.description,
          displayOrder: existingCategory.displayOrder,
          isRequired: existingCategory.isRequired,
          isActive: existingCategory.isActive,
          optionsCount: existingCategory.options.length,
        },
        after: {
          label: updatedCategory!.label,
          key: updatedCategory!.key,
          description: updatedCategory!.description,
          displayOrder: updatedCategory!.displayOrder,
          isRequired: updatedCategory!.isRequired,
          isActive: updatedCategory!.isActive,
          optionsCount: updatedCategory!.options.length,
        },
      } as Prisma.InputJsonValue,
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
          take: 1,
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

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

    await prisma.productAttributeCategory.delete({
      where: { id: categoryId },
    });

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
      } as Prisma.InputJsonValue,
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