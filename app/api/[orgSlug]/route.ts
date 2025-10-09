// FILE: app/api/[orgSlug]/route.ts
// Organization API - FIXED: Proper async params handling
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { transformDepartmentData } from '@/lib/department-helpers';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orgSlug: string }> }
) {
  try {
    // ✅ CRITICAL FIX: Get headers BEFORE awaiting params
    const headers = request.headers;
    const user = getUserFromHeaders(headers);
    
    if (!user) {
      console.log('❌ No user headers found in request');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // ✅ Now await params after headers are read
    const { orgSlug } = await context.params;
    
    console.log(`🔍 Loading organization data for: ${orgSlug} by user: ${user.userId}`);

    const access = await getUserOrgRole(user.userId, orgSlug);
    if (!access) {
      console.log(`❌ No access to organization: ${orgSlug}`);
      return NextResponse.json({ error: 'No access to organization' }, { status: 403 });
    }

    console.log(`✅ User has access with role: ${access.role}`);

    // Get organization with color and icon
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
        color: true,
        icon: true,
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

    const organizationData = {
      ...organization,
      color: organization.color || 'BLUE',
      icon: organization.icon || 'BUILDING',
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

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ orgSlug: string }> }
) {
  try {
    // ✅ CRITICAL FIX: Get headers BEFORE awaiting params
    const headers = request.headers;
    const user = getUserFromHeaders(headers);
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // ✅ Now await params
    const { orgSlug } = await context.params;

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