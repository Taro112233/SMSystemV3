// FILE: app/api/user/profile/route.ts
// User Profile API - Get/Update user profile
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getRequestMetadata } from "@/lib/audit-logger";
import { createUserSnapshot } from "@/lib/user-snapshot";

/**
 * GET - Get current user profile
 * NO AUDIT LOG - This is a read-only operation
 */
export async function GET() {
  try {
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get full user profile
    const userProfile = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        status: true,
        isActive: true,
        emailVerified: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ❌ NO AUDIT LOG - GET/Read operations are not logged

    return NextResponse.json({
      success: true,
      user: userProfile,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update user profile
 * ✅ WITH AUDIT LOG - Profile updates should be logged
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email, phone } = body;

    // Validate required fields
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Get current user data for audit comparison
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        status: true,
        isActive: true,
        emailVerified: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // ✅ Create audit log for profile update
    const userSnapshot = await createUserSnapshot(user.userId);
    const { ipAddress, userAgent } = getRequestMetadata(request);

    await createAuditLog({
      organizationId: null as unknown as string, // User profile is not org-specific
      userId: user.userId,
      userSnapshot,
      action: "user.profile_updated",
      category: "USER",
      severity: "INFO",
      description: `อัพเดทข้อมูลโปรไฟล์`,
      resourceId: user.userId,
      resourceType: "User",
      payload: {
        before: {
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: currentUser.email,
          phone: currentUser.phone,
        },
        after: {
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phone: updatedUser.phone,
        },
        changes: Object.keys(body),
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update user profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}