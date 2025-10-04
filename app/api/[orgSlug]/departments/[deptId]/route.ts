// FILE: app/api/[orgSlug]/departments/[deptId]/route.ts
// Departments API - Get, Update, Delete specific department
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { createAuditLog, getRequestMetadata } from '@/lib/audit-logger';

// GET - Get specific department
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; deptId: string }> }
) {
  try {
    const { orgSlug, deptId } = await params;
    
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

    // Get department
    const department = await prisma.department.findFirst({
      where: {
        id: deptId,
        organizationId: access.organizationId,
      },
    });

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      department,
    });
  } catch (error) {
    console.error('Get department failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update department
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; deptId: string }> }
) {
  try {
    const { orgSlug, deptId } = await params;
    
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

    // Check permission
    if (!['ADMIN', 'OWNER'].includes(access.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Check if department exists and belongs to organization
    const existingDept = await prisma.department.findFirst({
      where: {
        id: deptId,
        organizationId: access.organizationId,
      },
    });

    if (!existingDept) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
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

    // Check if new slug conflicts with another department
    if (slug !== existingDept.slug) {
      const slugConflict = await prisma.department.findFirst({
        where: {
          organizationId: access.organizationId,
          slug,
          id: { not: deptId },
        },
      });

      if (slugConflict) {
        return NextResponse.json(
          { error: 'Department with this slug already exists' },
          { status: 409 }
        );
      }
    }

    // Update department
    const updatedDept = await prisma.department.update({
      where: {
        id: deptId,
      },
      data: {
        name,
        slug,
        description: description || null,
        color: color || 'BLUE',
        icon: icon || 'BUILDING',
        isActive: isActive ?? true,
        updatedBy: user.userId,
      },
    });

    // ✅ Create audit log
    const { ipAddress, userAgent } = getRequestMetadata(request);
    
    await createAuditLog({
      organizationId: access.organizationId,
      userId: user.userId,
      departmentId: deptId,
      action: 'departments.update',
      category: 'DEPARTMENT',
      severity: 'INFO',
      description: `แก้ไขหน่วยงาน ${updatedDept.name}`,
      resourceId: deptId,
      resourceType: 'Department',
      payload: {
        before: {
          name: existingDept.name,
          slug: existingDept.slug,
          description: existingDept.description,
          color: existingDept.color,
          icon: existingDept.icon,
          isActive: existingDept.isActive,
        },
        after: {
          name: updatedDept.name,
          slug: updatedDept.slug,
          description: updatedDept.description,
          color: updatedDept.color,
          icon: updatedDept.icon,
          isActive: updatedDept.isActive,
        },
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      department: updatedDept,
      message: 'Department updated successfully',
    });
  } catch (error) {
    console.error('Update department failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete department
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; deptId: string }> }
) {
  try {
    const { orgSlug, deptId } = await params;
    
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

    // Check permission
    if (!['ADMIN', 'OWNER'].includes(access.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Check if department exists
    const department = await prisma.department.findFirst({
      where: {
        id: deptId,
        organizationId: access.organizationId,
      },
    });

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    // Delete department
    await prisma.department.delete({
      where: {
        id: deptId,
      },
    });

    // ✅ Create audit log
    const { ipAddress, userAgent } = getRequestMetadata(request);
    
    await createAuditLog({
      organizationId: access.organizationId,
      userId: user.userId,
      action: 'departments.delete',
      category: 'DEPARTMENT',
      severity: 'WARNING',
      description: `ลบหน่วยงาน ${department.name}`,
      resourceId: deptId,
      resourceType: 'Department',
      payload: {
        departmentName: department.name,
        departmentSlug: department.slug,
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    console.error('Delete department failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}