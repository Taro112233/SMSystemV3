// app/api/[orgSlug]/route.ts - FIXED TYPE SAFETY
// Organization API - Get organization data with departments list

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole, getOrganizationBySlug } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { transformDepartmentData } from '@/lib/department-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  try {
    // Await params before using
    const { orgSlug } = await params;
    
    // Get user from headers
    const user = getUserFromHeaders(request.headers);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    console.log(`🔍 Loading organization data for: ${orgSlug} by user: ${user.userId}`);

    // Verify organization access
    const access = await getUserOrgRole(user.userId, orgSlug);
    if (!access) {
      console.log(`❌ No access to organization: ${orgSlug}`);
      return NextResponse.json({ error: 'No access to organization' }, { status: 403 });
    }

    console.log(`✅ User has access with role: ${access.role}`);

    // Get organization details
    const organization = await getOrganizationBySlug(orgSlug);
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // ✅ FIXED: Include isActive in select and proper type handling
    const departments = await prisma.department.findMany({
      where: {
        organizationId: access.organizationId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        color: true,
        icon: true,
        parentId: true,
        isActive: true,        // ✅ FIXED: Add isActive to select
        createdAt: true,
        updatedAt: true,
        createdBy: true,
      },
      orderBy: [
        { parentId: 'asc' },   // Parent departments first
        { name: 'asc' }
      ]
    });

    console.log(`✅ Found ${departments.length} departments`);

    // ✅ FIXED: Use helper function for safe transformation
    const transformedDepartments = departments.map(dept => transformDepartmentData(dept));

    // Get organization member count
    const memberCount = await prisma.organizationUser.count({
      where: {
        organizationId: access.organizationId,
        isActive: true
      }
    });

    // Prepare organization response
    const organizationData = {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      description: organization.description,
      status: organization.status,
      timezone: organization.timezone,
      email: organization.email,
      phone: organization.phone,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
      memberCount,
      departmentCount: departments.length,
      
      // Include invite code info for ADMIN/OWNER
      ...((['ADMIN', 'OWNER'].includes(access.role)) && {
        inviteCode: null, // Will be populated when organization has invite code
        inviteEnabled: false,
      })
    };

    return NextResponse.json({
      success: true,
      organization: organizationData,
      departments: transformedDepartments,
      userRole: access.role,
      stats: {
        totalDepartments: departments.length,
        activeDepartments: departments.filter(d => d.isActive).length,  // ✅ FIXED: Now isActive exists
        totalMembers: memberCount,
        // TODO: Add more stats when product/stock models exist
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

// POST - Create new department (for ADMIN/OWNER only)
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

    // Check organization access and permissions
    const access = await getUserOrgRole(user.userId, orgSlug);
    if (!access) {
      return NextResponse.json({ error: 'No access to organization' }, { status: 403 });
    }

    // Check if user has permission to create departments
    if (!['ADMIN', 'OWNER'].includes(access.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { name, code, description, color, icon, parentId } = body;

    // Validate required fields
    if (!name || !code) {
      return NextResponse.json({ error: 'Name and code are required' }, { status: 400 });
    }

    // Check if code already exists in this organization
    const existingDept = await prisma.department.findFirst({
      where: {
        organizationId: access.organizationId,
        code: code.toUpperCase(),
      }
    });

    if (existingDept) {
      return NextResponse.json({ error: 'Department code already exists' }, { status: 409 });
    }

    // Create department
    const department = await prisma.department.create({
      data: {
        organizationId: access.organizationId,
        name: name.trim(),
        code: code.toUpperCase().trim(),
        description: description?.trim(),
        color: color || 'BLUE',
        icon: icon || 'BUILDING',
        parentId: parentId || null,
        isActive: true,
        createdBy: user.userId,
      },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        color: true,
        icon: true,
        isActive: true,
        createdAt: true,
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: access.organizationId,
        userId: user.userId,
        action: 'departments.create',
        payload: {
          departmentId: department.id,
          departmentName: department.name,
          departmentCode: department.code,
          timestamp: new Date().toISOString()
        }
      }
    });

    console.log(`✅ Department created: ${department.name} (${department.code})`);

    return NextResponse.json({
      success: true,
      department,
      message: 'Department created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create department error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}