// lib/user-snapshot.ts
// Helper functions for creating user snapshots
// ============================================

import { prisma } from '@/lib/prisma';

/**
 * ✅ FIXED: User Snapshot Type with index signature for Prisma compatibility
 */
export interface UserSnapshot {
  userId: string;
  username: string;
  fullName: string;
  email?: string;
  role?: string;
  [key: string]: string | undefined; // ✅ Add index signature for Prisma Json compatibility
}

/**
 * ✅ Create user snapshot from database user
 */
export async function createUserSnapshot(
  userId: string,
  organizationId?: string
): Promise<UserSnapshot> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      email: true,
    }
  });

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  const snapshot: UserSnapshot = {
    userId: user.id,
    username: user.username,
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email || undefined,
  };

  // ✅ If organization context provided, include role
  if (organizationId) {
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        userId,
        organizationId,
        isActive: true,
      },
      select: { roles: true }
    });

    if (orgUser) {
      snapshot.role = orgUser.roles;
    }
  }

  return snapshot;
}

/**
 * ✅ Create snapshot from JWT user (already in memory)
 */
export function createUserSnapshotFromJWT(
  jwtUser: {
    userId: string;
    username: string;
    firstName: string;
    lastName: string;
    email?: string;
  },
  role?: string
): UserSnapshot {
  return {
    userId: jwtUser.userId,
    username: jwtUser.username,
    fullName: `${jwtUser.firstName} ${jwtUser.lastName}`,
    email: jwtUser.email,
    role,
  };
}

/**
 * ✅ Format snapshot for display (safe handling of missing data)
 */
export function formatUserSnapshot(snapshot: UserSnapshot | null): string {
  if (!snapshot) return 'Unknown User';
  
  const role = snapshot.role ? ` (${snapshot.role})` : '';
  return `${snapshot.fullName}${role}`;
}

/**
 * ✅ Compare snapshots (useful for audit trails)
 */
export function compareUserSnapshots(
  before: UserSnapshot | null,
  after: UserSnapshot | null
): boolean {
  if (!before && !after) return true;
  if (!before || !after) return false;
  
  return before.userId === after.userId &&
         before.username === after.username &&
         before.fullName === after.fullName &&
         before.role === after.role;
}