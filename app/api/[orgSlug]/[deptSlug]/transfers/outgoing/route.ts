// app/api/[orgSlug]/[deptSlug]/transfers/outgoing/route.ts
// Outgoing Transfers API - List transfers FROM this department

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; deptSlug: string }> }
) {
  try {
    const { orgSlug, deptSlug } = await params;

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

    // Get department
    const department = await prisma.department.findFirst({
      where: {
        organizationId: access.organizationId,
        slug: deptSlug,
        isActive: true,
      },
    });

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    // Build where clause
    const where: any = {
      organizationId: access.organizationId,
      supplyingDepartmentId: department.id,
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (priority && priority !== 'all') {
      where.priority = priority;
    }

    // Fetch transfers
    const transfers = await prisma.transfer.findMany({
      where,
      include: {
        requestingDepartment: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: { requestedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: transfers,
      department: {
        id: department.id,
        name: department.name,
        slug: department.slug,
      },
    });
  } catch (error) {
    console.error('Get outgoing transfers failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}