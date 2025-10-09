// lib/audit-logger.ts
// UPDATED: Include user snapshots in audit logs
// ============================================

import { prisma } from '@/lib/prisma';
import { createUserSnapshot, createUserSnapshotFromJWT, type UserSnapshot } from '@/lib/user-snapshot';
import type { Prisma } from '@prisma/client';

type AuditCategory = 'PRODUCT' | 'STOCK' | 'TRANSFER' | 'USER' | 'ORGANIZATION' | 'DEPARTMENT' | 'AUTH' | 'SYSTEM';
type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

interface AuditLogParams {
  organizationId: string;
  userId?: string;
  userSnapshot?: UserSnapshot;    // ✅ NEW: Optional if already created
  targetUserId?: string;
  targetSnapshot?: UserSnapshot;  // ✅ NEW: Optional if already created
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
 */
export async function createAuditLog(params: AuditLogParams) {
  try {
    // ✅ Create user snapshots if not provided
    let userSnapshot = params.userSnapshot;
    let targetSnapshot = params.targetSnapshot;

    if (params.userId && !userSnapshot) {
      userSnapshot = await createUserSnapshot(params.userId, params.organizationId);
    }

    if (params.targetUserId && !targetSnapshot) {
      targetSnapshot = await createUserSnapshot(params.targetUserId, params.organizationId);
    }

    return await prisma.auditLog.create({
      data: {
        organizationId: params.organizationId,
        userId: params.userId,
        userSnapshot: userSnapshot as Prisma.InputJsonValue, // ✅ Store snapshot
        targetUserId: params.targetUserId,
        targetSnapshot: targetSnapshot as Prisma.InputJsonValue, // ✅ Store snapshot
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