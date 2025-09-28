// app/api/[orgSlug]/route.ts - FIXED FOR SEEDED DATA
// Organization API - Get organization data with departments list

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole, getOrganizationBySlug } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { mapColorThemeToTailwind, getDepartmentCategory } from '@/lib/department-helpers';

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

    // Get organization details with invite code fields
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
        createdAt: true,
        updatedAt: true,
        inviteCode: true,      // ✅ Include invite code fields
        inviteEnabled: true,   // ✅ Include invite enabled field
      },
    });
    
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // ✅ FIXED: Use correct field names from seeded data
    const departments = await prisma.department.findMany({
      where: {
        organizationId: access.organizationId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,              // ✅ Use 'slug' from schema
        description: true,
        color: true,
        icon: true,
        parentId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        organizationId: true,    // Include for validation
      },
      orderBy: [
        { parentId: 'asc' },   // Parent departments first
        { name: 'asc' }
      ]
    });

    console.log(`✅ Found ${departments.length} departments for ${orgSlug}`);

    // ✅ Transform departments with seeded data context
    const transformedDepartments = departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      code: dept.slug,                    // Map slug to code for frontend compatibility
      slug: dept.slug,                    // Keep original slug
      description: dept.description || `แผนก ${dept.name}`,
      color: mapColorThemeToTailwind(dept.color),
      icon: dept.icon || 'BUILDING',      // Keep as string, will be converted in frontend
      isActive: dept.isActive,
      parentId: dept.parentId,
      
      // Add mock stats for now (will be replaced with real data later)
      memberCount: Math.floor(Math.random() * 20) + 5,
      stockItems: Math.floor(Math.random() * 200) + 50,
      lowStock: Math.floor(Math.random() * 10),
      notifications: Math.floor(Math.random() * 5),
      manager: 'ไม่ระบุ',
      lastActivity: dept.updatedAt.toISOString(),
      category: getDepartmentCategory(dept.icon, dept.name),
      createdAt: dept.createdAt,
      updatedAt: dept.updatedAt,
    }));

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
        activeDepartments: departments.filter(d => d.isActive).length,
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
    const { name, slug, description, color, icon, parentId } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    // Check if slug already exists in this organization
    const existingDept = await prisma.department.findFirst({
      where: {
        organizationId: access.organizationId,
        slug: slug.toUpperCase(),
      }
    });

    if (existingDept) {
      return NextResponse.json({ error: 'Department slug already exists' }, { status: 409 });
    }

    // Create department
    const department = await prisma.department.create({
      data: {
        organizationId: access.organizationId,
        name: name.trim(),
        slug: slug.toUpperCase().trim(),
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
        slug: true,
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
          departmentSlug: department.slug,
          timestamp: new Date().toISOString()
        }
      }
    });

    console.log(`✅ Department created: ${department.name} (${department.slug})`);

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