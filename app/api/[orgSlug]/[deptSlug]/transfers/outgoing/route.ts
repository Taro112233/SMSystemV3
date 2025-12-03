// app/api/[orgSlug]/[deptSlug]/transfers/outgoing/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { TransferStatus, TransferPriority } from '@prisma/client';

// ✅ FIXED: Proper WhereClause type with Prisma enums
interface WhereClause {
  organizationId: string;
  supplyingDepartmentId: string;
  status?: TransferStatus;
  priority?: TransferPriority;
  OR?: Array<{
    code?: { contains: string; mode: 'insensitive' };
    title?: { contains: string; mode: 'insensitive' };
  }>;
}

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
    const search = searchParams.get('search');

    // Build where clause
    const where: WhereClause = {
      organizationId: access.organizationId,
      supplyingDepartmentId: department.id,
    };

    if (status && status !== 'all') {
      where.status = status as TransferStatus;
    }

    if (priority && priority !== 'all') {
      where.priority = priority as TransferPriority;
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch transfers with proper include
    const transfers = await prisma.transfer.findMany({
      where,
      include: {
        requestingDepartment: {
          select: { 
            id: true, 
            name: true, 
            slug: true 
          },
        },
        items: {
          select: { id: true },
        },
      },
      orderBy: { requestedAt: 'desc' },
    });

    // Format response to match Transfer type
    const formattedTransfers = transfers.map(transfer => ({
      id: transfer.id,
      code: transfer.code,
      title: transfer.title,
      organizationId: transfer.organizationId,
      requestingDepartmentId: transfer.requestingDepartmentId,
      requestingDepartment: transfer.requestingDepartment,
      supplyingDepartmentId: transfer.supplyingDepartmentId,
      supplyingDepartment: {
        id: department.id,
        name: department.name,
        slug: department.slug,
      },
      status: transfer.status,
      priority: transfer.priority,
      requestReason: transfer.requestReason,
      notes: transfer.notes,
      totalItems: transfer.items.length,
      requestedAt: transfer.requestedAt,
      approvedAt: transfer.approvedAt,
      preparedAt: transfer.preparedAt,
      deliveredAt: transfer.deliveredAt,
      cancelledAt: transfer.cancelledAt,
      requestedBy: transfer.requestedBy,
      requestedBySnapshot: transfer.requestedBySnapshot,
      createdAt: transfer.createdAt,
      updatedAt: transfer.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: formattedTransfers,
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