// app/api/[orgSlug]/departments/route.ts
// UPDATED: Add createdBySnapshot for department creation
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { createAuditLog, getRequestMetadata } from '@/lib/audit-logger';
import { createUserSnapshot } from '@/lib/user-snapshot';

// GET - List all departments (including inactive)
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

    const departments = await prisma.department.findMany({
      where: {
        organizationId: access.organizationId,
      },
      orderBy: [
        { isActive: 'desc' },
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
        { error: 'Insufficient permissions. ADMIN or OWNER required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, slug, description, color, icon, isActive } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

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

    // ✅ NEW: Create user snapshot
    const userSnapshot = await createUserSnapshot(user.userId, access.organizationId);

    // Create department with snapshot
    const department = await prisma.department.create({
      data: {
        organizationId: access.organizationId,
        name,
        slug,
        description: description || null,
        color: color || 'BLUE',
        icon: icon || 'BUILDING',
        isActive: isActive ?? true,
        createdBy: user.userId,
        createdBySnapshot: userSnapshot, // ✅ Store creator snapshot
      },
    });

    // ✅ Create audit log with snapshot
    const { ipAddress, userAgent } = getRequestMetadata(request);
    
    await createAuditLog({
      organizationId: access.organizationId,
      userId: user.userId,
      userSnapshot, // ✅ Pass snapshot
      departmentId: department.id,
      action: 'departments.create',
      category: 'DEPARTMENT',
      severity: 'INFO',
      description: `สร้างหน่วยงาน ${department.name}`,
      resourceId: department.id,
      resourceType: 'Department',
      payload: {
        departmentName: name,
        departmentSlug: slug,
      },
      ipAddress,
      userAgent,
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