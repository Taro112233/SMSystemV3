// app/api/[orgSlug]/transfers/route.ts
// Organization Transfers API - List & Create

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { createTransfer } from '@/lib/transfer-helpers';
import { TransferStatus, TransferPriority } from '@prisma/client';

// ✅ FIXED: Proper WhereClause type with Prisma enums
interface WhereClause {
  organizationId: string;
  status?: TransferStatus;
  priority?: TransferPriority;
  OR?: Array<{
    code?: { contains: string; mode: 'insensitive' };
    title?: { contains: string; mode: 'insensitive' };
  }>;
}

// GET - List all transfers in organization
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

    // Get query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: WhereClause = {
      organizationId: access.organizationId,
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

    // Fetch transfers
    const [transfers, total] = await Promise.all([
      prisma.transfer.findMany({
        where,
        include: {
          requestingDepartment: {
            select: { id: true, name: true, slug: true },
          },
          supplyingDepartment: {
            select: { id: true, name: true, slug: true },
          },
          items: {
            select: { id: true },
          },
        },
        orderBy: { requestedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transfer.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: transfers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get transfers failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new transfer
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

    const body = await request.json();
    const {
      transferCode,
      requestingDepartmentId,
      supplyingDepartmentId,
      title,
      requestReason,
      priority,
      notes,
      items,
    } = body;

    // Validation
    if (!transferCode || !requestingDepartmentId || !supplyingDepartmentId || !title || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // ✅ Check if transferCode already exists in organization
    const existingTransfer = await prisma.transfer.findUnique({
      where: {
        organizationId_code: {
          organizationId: access.organizationId,
          code: transferCode.trim(),
        },
      },
    });

    if (existingTransfer) {
      return NextResponse.json(
        { 
          error: 'Transfer code already exists',
          message: `เลขที่ใบเบิก ${transferCode} มีอยู่ในระบบแล้ว กรุณาใช้เลขที่อื่น`,
        },
        { status: 409 }
      );
    }

    // Create transfer using helper
    const transfer = await createTransfer({
      organizationId: access.organizationId,
      transferCode: transferCode.trim(),
      requestingDepartmentId,
      supplyingDepartmentId,
      title,
      requestReason,
      priority: priority || 'NORMAL',
      notes,
      items,
      requestedBy: user.userId,
    });

    return NextResponse.json({
      success: true,
      data: transfer,
      message: 'Transfer created successfully',
    });
  } catch (error) {
    console.error('Create transfer failed:', error);
    
    // Handle Prisma unique constraint error
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { 
          error: 'Transfer code already exists',
          message: 'เลขที่ใบเบิกซ้ำกับใบเบิกอื่นในระบบ',
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}