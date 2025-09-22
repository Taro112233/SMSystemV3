// lib/invite-code.ts
// ===== SIMPLE INVITE CODE SYSTEM =====

import { prisma } from './prisma';
import { randomBytes } from 'crypto';

/**
 * Generate secure invite code for organization
 */
export function generateInviteCode(): string {
  // Format: ORG-XXXXXX (6 uppercase alphanumeric)
  const randomPart = randomBytes(3)
    .toString('hex')
    .toUpperCase()
    .substring(0, 6);
  
  return `ORG-${randomPart}`;
}

/**
 * Generate or refresh organization invite code
 */
export async function createOrganizationInviteCode(
  organizationId: string,
  userId: string
): Promise<{ inviteCode: string; success: boolean }> {
  try {
    // Check if user is owner/admin
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        organizationId,
        userId,
        isActive: true,
        roles: { in: ['ADMIN', 'OWNER'] }
      }
    });

    if (!orgUser) {
      throw new Error('Permission denied: requires ADMIN or OWNER role');
    }

    let inviteCode: string;
    let attempts = 0;
    const maxAttempts = 10;

    // Generate unique code
    do {
      inviteCode = generateInviteCode();
      attempts++;
      
      // Check if code already exists
      const existing = await prisma.organization.findUnique({
        where: { inviteCode }
      });
      
      if (!existing) break;
      
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique invite code');
    }

    // Update organization with new invite code
    await prisma.organization.update({
      where: { id: organizationId },
      data: { 
        inviteCode,
        inviteEnabled: true
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId,
        action: 'organization.invite_code_generated',
        payload: {
          inviteCode,
          timestamp: new Date().toISOString()
        }
      }
    });

    return { inviteCode, success: true };

  } catch (error) {
    console.error('Create invite code error:', error);
    throw error;
  }
}

/**
 * Join organization via invite code
 */
export async function joinByInviteCode(
  inviteCode: string,
  userId: string
): Promise<{ organization: any; success: boolean }> {
  try {
    // Find organization by invite code
    const organization = await prisma.organization.findUnique({
      where: { 
        inviteCode,
        inviteEnabled: true,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        status: true
      }
    });

    if (!organization) {
      throw new Error('Invalid or disabled invite code');
    }

    // Check if user already member
    const existingMembership = await prisma.organizationUser.findUnique({
      where: {
        organizationId_userId: {
          organizationId: organization.id,
          userId
        }
      }
    });

    if (existingMembership) {
      throw new Error('User is already a member of this organization');
    }

    // Join organization as MEMBER
    await prisma.organizationUser.create({
      data: {
        organizationId: organization.id,
        userId,
        roles: 'MEMBER',
        isActive: true,
        joinedAt: new Date()
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: organization.id,
        userId,
        action: 'users.joined_by_invite_code',
        payload: {
          inviteCode,
          organizationName: organization.name,
          timestamp: new Date().toISOString()
        }
      }
    });

    return { organization, success: true };

  } catch (error) {
    console.error('Join by invite code error:', error);
    throw error;
  }
}

/**
 * Disable organization invite code
 */
export async function disableInviteCode(
  organizationId: string,
  userId: string
): Promise<{ success: boolean }> {
  try {
    // Check permission
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        organizationId,
        userId,
        isActive: true,
        roles: { in: ['ADMIN', 'OWNER'] }
      }
    });

    if (!orgUser) {
      throw new Error('Permission denied');
    }

    // Disable invite code
    await prisma.organization.update({
      where: { id: organizationId },
      data: { inviteEnabled: false }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId,
        action: 'organization.invite_code_disabled',
        payload: {
          timestamp: new Date().toISOString()
        }
      }
    });

    return { success: true };

  } catch (error) {
    console.error('Disable invite code error:', error);
    throw error;
  }
}

/**
 * Get organization invite code info (for admins)
 */
export async function getInviteCodeInfo(
  organizationId: string,
  userId: string
): Promise<{
  inviteCode: string | null;
  inviteEnabled: boolean;
  memberCount: number;
}> {
  try {
    // Check permission
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        organizationId,
        userId,
        isActive: true,
        roles: { in: ['ADMIN', 'OWNER'] }
      }
    });

    if (!orgUser) {
      throw new Error('Permission denied');
    }

    // Get organization info
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        inviteCode: true,
        inviteEnabled: true
      }
    });

    // Count total active members
    const memberCount = await prisma.organizationUser.count({
      where: {
        organizationId,
        isActive: true
      }
    });

    return {
      inviteCode: organization?.inviteCode || null,
      inviteEnabled: organization?.inviteEnabled || false,
      memberCount
    };

  } catch (error) {
    console.error('Get invite code info error:', error);
    throw error;
  }
}

/**
 * Validate invite code format
 */
export function isValidInviteCodeFormat(code: string): boolean {
  // Format: ORG-XXXXXX (ORG- prefix + 6 alphanumeric)
  const pattern = /^ORG-[A-Z0-9]{6}$/;
  return pattern.test(code.toUpperCase());
}