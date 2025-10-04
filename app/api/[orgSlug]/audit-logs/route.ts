// FILE: app/api/[orgSlug]/audit-logs/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

/**
 * GET - Get recent audit logs for organization dashboard
 * NO AUDIT LOG - This is a read-only operation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  try {
    const { orgSlug } = await params;
    
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const category = searchParams.get('category');
    const severity = searchParams.get('severity');

    // ✅ FIXED: Use Prisma.AuditLogWhereInput type
    const whereClause: Prisma.AuditLogWhereInput = {
      organizationId: access.organizationId,
    };

    if (category) {
      whereClause.category = category as Prisma.EnumAuditCategoryFilter;
    }

    if (severity) {
      whereClause.severity = severity as Prisma.EnumAuditSeverityFilter;
    }

    // Get recent audit logs with user and department info
    const auditLogs = await prisma.auditLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        department: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // ❌ NO AUDIT LOG - GET/Read operations are not logged

    return NextResponse.json({
      success: true,
      logs: auditLogs,
      count: auditLogs.length,
    });

  } catch (error) {
    console.error('Get audit logs failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}