// lib/audit-logger.ts
// UPDATED: Support optional organizationId for user-level audits
// ============================================

import { prisma } from '@/lib/prisma';
import { createUserSnapshot, type UserSnapshot } from '@/lib/user-snapshot';
import type { Prisma } from '@prisma/client';

type AuditCategory = 'PRODUCT' | 'STOCK' | 'TRANSFER' | 'USER' | 'ORGANIZATION' | 'DEPARTMENT' | 'AUTH' | 'SYSTEM';
type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

interface AuditLogParams {
  organizationId?: string | null;  // ✅ UPDATED: Made optional for user-level actions
  userId?: string;
  userSnapshot?: UserSnapshot;    // ✅ Optional if already created
  targetUserId?: string;
  targetSnapshot?: UserSnapshot;  // ✅ Optional if already created
  departmentId?: string;
  action: string;
  category: AuditCategory;
  severity?: AuditSeverity;
  description: string;
  resourceId?: string;
  resourceType?: string;
  payload?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * ✅ Create audit log with user snapshots
 * Supports both organization-level and user-level audits
 */
export async function createAuditLog(params: AuditLogParams) {
  try {
    // ✅ Create user snapshots if not provided
    let userSnapshot = params.userSnapshot;
    let targetSnapshot = params.targetSnapshot;

    if (params.userId && !userSnapshot) {
      // ✅ UPDATED: organizationId is now optional
      userSnapshot = await createUserSnapshot(
        params.userId, 
        params.organizationId || undefined
      );
    }

    if (params.targetUserId && !targetSnapshot) {
      // ✅ UPDATED: organizationId is now optional
      targetSnapshot = await createUserSnapshot(
        params.targetUserId, 
        params.organizationId || undefined
      );
    }

    return await prisma.auditLog.create({
      data: {
        organizationId: params.organizationId || undefined,  // ✅ UPDATED: Handle null/undefined
        userId: params.userId,
        userSnapshot: userSnapshot as Prisma.InputJsonValue,
        targetUserId: params.targetUserId,
        targetSnapshot: targetSnapshot as Prisma.InputJsonValue,
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
    // ✅ Don't throw - audit logs should not break business logic
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
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * ✅ NEW: Get user-level audit logs (no organization filter)
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 50
) {
  return await prisma.auditLog.findMany({
    where: {
      userId,
      organizationId: null,  // Only user-level actions
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * ✅ NEW: Get all audit logs for a user (both org and user level)
 */
export async function getAllUserAuditLogs(
  userId: string,
  limit: number = 100
) {
  return await prisma.auditLog.findMany({
    where: {
      OR: [
        { userId },
        { targetUserId: userId },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}