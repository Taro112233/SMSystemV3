// app/api/[orgSlug]/departments/[deptId]/route.ts
// Department CRUD API - Update and Delete

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const UpdateDepartmentSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional().nullable(),
  color: z.enum([
    'BLUE', 'GREEN', 'RED', 'YELLOW', 'PURPLE', 'PINK',
    'INDIGO', 'TEAL', 'ORANGE', 'GRAY', 'SLATE', 'EMERALD'
  ]).optional(),
  icon: z.enum([
    'BUILDING', 'HOSPITAL', 'PHARMACY', 'WAREHOUSE', 'LABORATORY',
    'PILL', 'BOTTLE', 'SYRINGE', 'BANDAGE', 'STETHOSCOPE',
    'CROWN', 'SHIELD', 'PERSON', 'EYE', 'GEAR',
    'BOX', 'FOLDER', 'TAG', 'STAR', 'HEART', 'CIRCLE', 'SQUARE', 'TRIANGLE'
  ]).optional(),
  isActive: z.boolean().optional(),
  parentId: z.string().optional().nullable(),
});

// PATCH - Update department
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; deptId: string }> }
) {
  try {
    const { orgSlug, deptId } = await params;
    
    const user = getUserFromHeaders(request.headers);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const access = await getUserOrgRole(user.userId, orgSlug);
    if (!access) {
      return NextResponse.json({ error: 'No access to organization' }, { status: 403 });
    }

    // Check permission (ADMIN or OWNER)
    if (!['ADMIN', 'OWNER'].includes(access.role)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions',
        message: 'Only ADMIN or OWNER can update departments' 
      }, { status: 403 });
    }

    // Verify department belongs to organization
    const existingDept = await prisma.department.findFirst({
      where: {
        id: deptId,
        organizationId: access.organizationId
      }
    });

    if (!existingDept) {
      return NextResponse.json({ 
        error: 'Department not found' 
      }, { status: 404 });
    }

    const body = await request.json();
    const validation = UpdateDepartmentSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid input data',
        details: validation.error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    const updateData = validation.data;

    // Check if slug is being changed and is unique
    if (updateData.slug && updateData.slug !== existingDept.slug) {
      const slugExists = await prisma.department.findFirst({
        where: {
          organizationId: access.organizationId,
          slug: updateData.slug,
          id: { not: deptId }
        }
      });

      if (slugExists) {
        return NextResponse.json({
          error: 'Department slug already exists'
        }, { status: 409 });
      }
    }

    // Update department
    const updatedDept = await prisma.department.update({
      where: { id: deptId },
      data: {
        ...updateData,
        updatedBy: user.userId,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        color: true,
        icon: true,
        isActive: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: access.organizationId,
        userId: user.userId,
        action: 'departments.updated',
        resourceId: deptId,
        payload: {
          departmentName: updatedDept.name,
          changes: updateData,
          timestamp: new Date().toISOString(),
        }
      }
    });

    console.log(`✅ Department updated: ${updatedDept.name} by ${user.userId}`);

    return NextResponse.json({
      success: true,
      message: 'Department updated successfully',
      department: updatedDept
    });

  } catch (error) {
    console.error('Update department error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// DELETE - Delete department
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; deptId: string }> }
) {
  try {
    const { orgSlug, deptId } = await params;
    
    const user = getUserFromHeaders(request.headers);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const access = await getUserOrgRole(user.userId, orgSlug);
    if (!access) {
      return NextResponse.json({ error: 'No access to organization' }, { status: 403 });
    }

    // Check permission (ADMIN or OWNER)
    if (!['ADMIN', 'OWNER'].includes(access.role)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions',
        message: 'Only ADMIN or OWNER can delete departments' 
      }, { status: 403 });
    }

    // Verify department belongs to organization
    const department = await prisma.department.findFirst({
      where: {
        id: deptId,
        organizationId: access.organizationId
      },
      include: {
        children: true
      }
    });

    if (!department) {
      return NextResponse.json({ 
        error: 'Department not found' 
      }, { status: 404 });
    }

    // Check if department has children (can't delete parent departments)
    if (department.children.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete department with sub-departments',
        message: 'Please delete or reassign sub-departments first'
      }, { status: 400 });
    }

    // Delete department
    await prisma.department.delete({
      where: { id: deptId }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: access.organizationId,
        userId: user.userId,
        action: 'departments.deleted',
        resourceId: deptId,
        payload: {
          departmentName: department.name,
          departmentSlug: department.slug,
          timestamp: new Date().toISOString(),
        }
      }
    });

    console.log(`✅ Department deleted: ${department.name} by ${user.userId}`);

    return NextResponse.json({
      success: true,
      message: 'Department deleted successfully'
    });

  } catch (error) {
    console.error('Delete department error:', error);
    
    // Handle foreign key constraint errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string };
      if (prismaError.code === 'P2003') {
        return NextResponse.json({
          error: 'Cannot delete department',
          message: 'This department is referenced by other records'
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}