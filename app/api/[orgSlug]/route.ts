// FILE: app/api/[orgSlug]/route.ts
// Organization API - UPDATED to return Icon & Color
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { transformDepartmentData } from '@/lib/department-helpers';
import { createAuditLog, getRequestMetadata } from '@/lib/audit-logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  try {
    const { orgSlug } = await params;
    
    const user = getUserFromHeaders(request.headers);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    console.log(`🔍 Loading organization data for: ${orgSlug} by user: ${user.userId}`);

    const access = await getUserOrgRole(user.userId, orgSlug);
    if (!access) {
      console.log(`❌ No access to organization: ${orgSlug}`);
      return NextResponse.json({ error: 'No access to organization' }, { status: 403 });
    }

    console.log(`✅ User has access with role: ${access.role}`);

    // ✅ UPDATED: Get organization with color and icon
    const organization = await prisma.organization.findUnique({
      where: { 
        slug: orgSlug,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        status: true,
        timezone: true,
        email: true,
        phone: true,
        color: true,         // ✅ CRITICAL: Include color
        icon: true,          // ✅ CRITICAL: Include icon
        createdAt: true,
        updatedAt: true,
        inviteCode: true,
        inviteEnabled: true,
      },
    });
    
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Get ONLY ACTIVE departments
    const departments = await prisma.department.findMany({
      where: {
        organizationId: access.organizationId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        color: true,
        icon: true,
        parentId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        organizationId: true,
      },
      orderBy: [
        { parentId: 'asc' },
        { name: 'asc' }
      ]
    });

    console.log(`✅ Found ${departments.length} ACTIVE departments for ${orgSlug}`);

    // Transform departments
    const transformedDepartments = departments.map(dept => transformDepartmentData({
      id: dept.id,
      name: dept.name,
      slug: dept.slug,
      description: dept.description,
      color: dept.color,
      icon: dept.icon,
      isActive: dept.isActive,
      parentId: dept.parentId,
      createdAt: dept.createdAt,
      updatedAt: dept.updatedAt
    }));

    const memberCount = await prisma.organizationUser.count({
      where: { organizationId: access.organizationId }
    });

    // ✅ UPDATED: Include color and icon in organization data
    const organizationData = {
      ...organization,
      color: organization.color || 'BLUE',      // ✅ Default if null
      icon: organization.icon || 'BUILDING',    // ✅ Default if null
      memberCount,
      ...(['ADMIN', 'OWNER'].includes(access.role) && {
        inviteCode: organization.inviteCode,
        inviteEnabled: organization.inviteEnabled,
      })
    };

    return NextResponse.json({
      success: true,
      organization: organizationData,
      departments: transformedDepartments,
      userRole: access.role,
      stats: {
        totalDepartments: departments.length,
        activeDepartments: departments.length,
        totalMembers: memberCount,
        totalProducts: 0,
        lowStockItems: 0,
        pendingTransfers: 0
      }
    });

  } catch (error) {
    console.error('Organization API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
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
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const access = await getUserOrgRole(user.userId, orgSlug);
    if (!access) {
      return NextResponse.json({ error: 'No access to organization' }, { status: 403 });
    }

    if (!['ADMIN', 'OWNER'].includes(access.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { name, slug, description, color, icon } = body;
    
    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const existingDept = await prisma.department.findFirst({
      where: {
        organizationId: access.organizationId,
        slug: slug
      }
    });

    if (existingDept) {
      return NextResponse.json({ error: 'Department slug already exists' }, { status: 409 });
    }

    const newDepartment = await prisma.department.create({
      data: {
        name,
        slug,
        description: description || `หน่วยงาน ${name}`,
        color: color || 'BLUE',
        icon: icon || 'BUILDING',
        organizationId: access.organizationId,
        createdBy: user.userId,
        isActive: true
      }
    });

    console.log(`✅ Created new department: ${newDepartment.name} (${newDepartment.slug})`);

    const { ipAddress, userAgent } = getRequestMetadata(request);
    
    await createAuditLog({
      organizationId: access.organizationId,
      userId: user.userId,
      departmentId: newDepartment.id,
      action: 'departments.create',
      category: 'DEPARTMENT',
      severity: 'INFO',
      description: `สร้างหน่วยงาน ${newDepartment.name}`,
      resourceId: newDepartment.id,
      resourceType: 'Department',
      payload: {
        departmentName: name,
        departmentSlug: slug,
      },
      ipAddress,
      userAgent,
    });

    const transformedDept = transformDepartmentData({
      id: newDepartment.id,
      name: newDepartment.name,
      slug: newDepartment.slug,
      description: newDepartment.description,
      color: newDepartment.color,
      icon: newDepartment.icon,
      isActive: newDepartment.isActive,
      parentId: newDepartment.parentId,
      createdAt: newDepartment.createdAt,
      updatedAt: newDepartment.updatedAt
    });

    return NextResponse.json({
      success: true,
      department: transformedDept,
      message: 'Department created successfully'
    });

  } catch (error) {
    console.error('Create department error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}