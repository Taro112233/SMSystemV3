// lib/audit-logger.ts
import { prisma } from '@/lib/prisma';

type AuditCategory = 'PRODUCT' | 'STOCK' | 'TRANSFER' | 'USER' | 'ORGANIZATION' | 'DEPARTMENT' | 'AUTH' | 'SYSTEM';
type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

interface AuditLogParams {
  organizationId: string;
  userId?: string;
  targetUserId?: string;        // ✅ NEW
  departmentId?: string;
  action: string;
  category: AuditCategory;      // ✅ NEW
  severity?: AuditSeverity;     // ✅ NEW
  description: string;
  resourceId?: string;
  resourceType?: string;
  payload?: any;
  ipAddress?: string;
  userAgent?: string;           // ✅ NEW
}

/**
 * Create audit log with full context
 */
export async function createAuditLog(params: AuditLogParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        organizationId: params.organizationId,
        userId: params.userId,
        targetUserId: params.targetUserId,
        departmentId: params.departmentId,
        action: params.action,
        category: params.category,
        severity: params.severity || 'INFO',
        description: params.description,
        resourceId: params.resourceId,
        resourceType: params.resourceType,
        payload: params.payload,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Get request metadata (IP + User-Agent)
 */
export function getRequestMetadata(request: Request) {
  return {
    ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
  };
}

/**
 * Get audit logs by severity
 */
export async function getCriticalAuditLogs(
  organizationId: string,
  limit: number = 50
) {
  return await prisma.auditLog.findMany({
    where: {
      organizationId,
      severity: 'CRITICAL',
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      department: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Get audit logs by category
 */
export async function getAuditLogsByCategory(
  organizationId: string,
  category: AuditCategory,
  limit: number = 50
) {
  return await prisma.auditLog.findMany({
    where: {
      organizationId,
      category,
    },
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
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}