// app/api/[orgSlug]/product-categories/route.ts
// Product Attribute Categories API - List & Create (FIXED)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { createAuditLog, getRequestMetadata } from '@/lib/audit-logger';
import { createUserSnapshot } from '@/lib/user-snapshot';

// GET - List all categories
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

    const categories = await prisma.productAttributeCategory.findMany({
      where: {
        organizationId: access.organizationId,
      },
      orderBy: [
        { displayOrder: 'asc' },
        { label: 'asc' }
      ],
    });

    return NextResponse.json({
      success: true,
      categories,
      stats: {
        total: categories.length,
        active: categories.filter(c => c.isActive).length,
        inactive: categories.filter(c => !c.isActive).length,
      }
    });
  } catch (error) {
    console.error('Get categories failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new category
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

    // ✅ Only ADMIN/OWNER can create categories
    if (!['ADMIN', 'OWNER'].includes(access.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. ADMIN or OWNER required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { key, label, description, options, displayOrder, isRequired, isActive } = body;

    // Validation
    if (!key || !label) {
      return NextResponse.json(
        { error: 'Key and label are required' },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9_]+$/.test(key)) {
      return NextResponse.json(
        { error: 'Key must contain only lowercase letters, numbers, and underscores' },
        { status: 400 }
      );
    }

    if (!Array.isArray(options) || options.length === 0) {
      return NextResponse.json(
        { error: 'Options must be a non-empty array' },
        { status: 400 }
      );
    }

    // Check duplicate key
    const existingCategory = await prisma.productAttributeCategory.findFirst({
      where: {
        organizationId: access.organizationId,
        key,
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this key already exists' },
        { status: 409 }
      );
    }

    // ✅ Create user snapshot
    const userSnapshot = await createUserSnapshot(user.userId, access.organizationId);

    // ✅ FIXED: Convert displayOrder to Int
    const displayOrderInt = displayOrder !== undefined 
      ? (typeof displayOrder === 'string' ? parseInt(displayOrder, 10) : displayOrder)
      : 0;

    // Create category
    const category = await prisma.productAttributeCategory.create({
      data: {
        organizationId: access.organizationId,
        key,
        label,
        description: description || null,
        options: options,
        displayOrder: displayOrderInt, // ✅ Use Int value
        isRequired: isRequired ?? false,
        isActive: isActive ?? true,
        createdBy: user.userId,
        createdBySnapshot: userSnapshot,
      },
    });

    // ✅ Audit log
    const { ipAddress, userAgent } = getRequestMetadata(request);
    
    await createAuditLog({
      organizationId: access.organizationId,
      userId: user.userId,
      userSnapshot,
      action: 'product_categories.create',
      category: 'PRODUCT',
      severity: 'INFO',
      description: `สร้างหมวดหมู่สินค้า ${category.label}`,
      resourceId: category.id,
      resourceType: 'ProductAttributeCategory',
      payload: {
        categoryKey: key,
        categoryLabel: label,
        optionsCount: options.length,
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      category,
      message: 'Category created successfully',
    });
  } catch (error) {
    console.error('Create category failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}