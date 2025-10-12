// FILE: app/api/user/change-password/route.ts
// Change Password API - Update user password with audit logging
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, hashPassword, validatePasswordStrength } from '@/lib/auth';
import { createAuditLog, getRequestMetadata } from '@/lib/audit-logger';
import { createUserSnapshot } from '@/lib/user-snapshot';

/**
 * POST - Change user password
 * ✅ WITH AUDIT LOG - Password changes are critical security events
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          error: 'Password does not meet requirements',
          details: passwordValidation.errors
        },
        { status: 400 }
      );
    }

    // Get user with password
    const userWithPassword = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        password: true,
        firstName: true,
        lastName: true,
      }
    });

    if (!userWithPassword) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(
      currentPassword, 
      userWithPassword.password
    );

    if (!isPasswordValid) {
      // ✅ Log failed password change attempt
      const userSnapshot = await createUserSnapshot(user.userId);
      const { ipAddress, userAgent } = getRequestMetadata(request);

      await createAuditLog({
        organizationId: null as unknown as string,
        userId: user.userId,
        userSnapshot,
        action: 'user.password_change_failed',
        category: 'AUTH',
        severity: 'WARNING',
        description: `ความพยายามเปลี่ยนรหัสผ่านล้มเหลว - รหัสผ่านปัจจุบันไม่ถูกต้อง`,
        resourceId: user.userId,
        resourceType: 'User',
        ipAddress,
        userAgent,
      });

      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: user.userId },
      data: { password: hashedPassword },
    });

    // ✅ Log successful password change
    const userSnapshot = await createUserSnapshot(user.userId);
    const { ipAddress, userAgent } = getRequestMetadata(request);

    await createAuditLog({
      organizationId: null as unknown as string,
      userId: user.userId,
      userSnapshot,
      action: 'user.password_changed',
      category: 'AUTH',
      severity: 'WARNING', // Password changes are important security events
      description: `เปลี่ยนรหัสผ่านสำเร็จ`,
      resourceId: user.userId,
      resourceType: 'User',
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}