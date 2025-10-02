// FILE: app/api/[orgSlug]/departments/route.ts
// Departments API - List all departments (UPDATED: Show all for Settings)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

// GET - List all departments (including inactive)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  try {
    const { orgSlug } = await params;
    
    // Check authentication
    const user = getUserFromHeaders(request.headers);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check organization access
    const access = await getUserOrgRole(user.userId, orgSlug);
    if (!access) {
      return NextResponse.json(
        { error: 'No access to organization' },
        { status: 403 }
      );
    }

    // ✅ UPDATED: Get ALL departments (no isActive filter)
    const departments = await prisma.department.findMany({
      where: {
        organizationId: access.organizationId,
        // ✅ ไม่กรอง isActive เพื่อให้ Settings แสดงทั้งหมด
      },
      orderBy: [
        { isActive: 'desc' }, // Active ขึ้นก่อน
        { name: 'asc' }
      ],
    });

    return NextResponse.json({
      success: true,
      departments,
      stats: {
        total: departments.length,
        active: departments.filter(d => d.isActive).length,
        inactive: departments.filter(d => !d.isActive).length,
      }
    });
  } catch (error) {
    console.error('Get departments failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new department
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  try {
    const { orgSlug } = await params;
    
    // Check authentication
    const user = getUserFromHeaders(request.headers);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check organization access
    const access = await getUserOrgRole(user.userId, orgSlug);
    if (!access) {
      return NextResponse.json(
        { error: 'No access to organization' },
        { status: 403 }
      );
    }

    // Check permission - only ADMIN and OWNER can create departments
    if (!['ADMIN', 'OWNER'].includes(access.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. ADMIN or OWNER required.' },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const { name, slug, description, color, icon, isActive } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    // Check if slug already exists in this organization
    const existingDept = await prisma.department.findFirst({
      where: {
        organizationId: access.organizationId,
        slug,
      },
    });

    if (existingDept) {
      return NextResponse.json(
        { error: 'Department with this slug already exists' },
        { status: 409 }
      );
    }

    // ✅ FIXED: Create department with createdBy field
    const department = await prisma.department.create({
      data: {
        organizationId: access.organizationId,
        name,
        slug,
        description: description || null,
        color: color || 'BLUE',
        icon: icon || 'BUILDING',
        isActive: isActive ?? true,
        createdBy: user.userId, // ✅ ADDED
      },
    });

    // ✅ FIXED: Create audit log without entityType
    await prisma.auditLog.create({
      data: {
        organizationId: access.organizationId,
        userId: user.userId,
        action: 'departments.create',
        resourceId: department.id,
        payload: {
          departmentName: name,
          departmentSlug: slug,
        },
      },
    });

    return NextResponse.json({
      success: true,
      department,
      message: 'Department created successfully',
    });
  } catch (error) {
    console.error('Create department failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}