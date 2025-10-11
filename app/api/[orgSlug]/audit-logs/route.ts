// FILE: app/api/[orgSlug]/audit-logs/route.ts
// UPDATED: Return userSnapshot instead of user relation

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

/**
 * GET - Get recent audit logs for organization dashboard
 * ✅ UPDATED: Use userSnapshot instead of user relation
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

    const whereClause: Prisma.AuditLogWhereInput = {
      organizationId: access.organizationId,
    };

    if (category) {
      whereClause.category = category as Prisma.EnumAuditCategoryFilter;
    }

    if (severity) {
      whereClause.severity = severity as Prisma.EnumAuditSeverityFilter;
    }

    // ✅ UPDATED: Select userSnapshot instead of user relation
    const auditLogs = await prisma.auditLog.findMany({
      where: whereClause,
      select: {
        id: true,
        action: true,
        category: true,
        severity: true,
        description: true,
        createdAt: true,
        userSnapshot: true,        // ✅ Use snapshot
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