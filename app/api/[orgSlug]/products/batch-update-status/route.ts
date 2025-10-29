// app/api/[orgSlug]/products/batch-update-status/route.ts
// Batch update product status API endpoint

import { NextRequest, NextResponse } from "next/server";
import { getUserFromHeaders, getUserOrgRole } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getRequestMetadata } from "@/lib/audit-logger";
import { createUserSnapshot } from "@/lib/user-snapshot";

interface BatchUpdateRequest {
  updates: Array<{
    productId: string;
    isActive: boolean;
  }>;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  try {
    const { orgSlug } = await params;

    const user = getUserFromHeaders(request.headers);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const access = await getUserOrgRole(user.userId, orgSlug);
    if (!access) {
      return NextResponse.json(
        { error: "No access to organization" },
        { status: 403 }
      );
    }

    // Check permissions - only ADMIN and OWNER can update product status
    if (!access.role || !["ADMIN", "OWNER"].includes(access.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body: BatchUpdateRequest = await request.json();
    const { updates } = body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 }
      );
    }

    // Validate all product IDs belong to the organization
    const productIds = updates.map((update) => update.productId);
    const existingProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        organizationId: access.organizationId,
      },
      select: { id: true, name: true, code: true, isActive: true },
    });

    if (existingProducts.length !== productIds.length) {
      return NextResponse.json(
        { error: "Some products not found or access denied" },
        { status: 404 }
      );
    }

    // Create user snapshot for audit
    const userSnapshot = await createUserSnapshot(
      user.userId,
      access.organizationId
    );

    // Perform batch update
    const updateResults = await Promise.all(
      updates.map(async (update) => {
        const existingProduct = existingProducts.find(
          (p) => p.id === update.productId
        );
        if (!existingProduct) return null;

        // Skip if no change needed
        if (existingProduct.isActive === update.isActive) {
          return { productId: update.productId, skipped: true };
        }

        // Update the product
        await prisma.product.update({
          where: { id: update.productId },
          data: {
            isActive: update.isActive,
            updatedBy: user.userId,
            updatedBySnapshot: userSnapshot,
          },
        });

        return {
          productId: update.productId,
          updated: true,
          previousStatus: existingProduct.isActive,
          newStatus: update.isActive,
          productName: existingProduct.name,
          productCode: existingProduct.code,
        };
      })
    );

    // Filter out null results and create audit logs
    const successfulUpdates = updateResults.filter(
      (result) => result && result.updated
    );

    // Get request metadata for audit
    const { ipAddress, userAgent } = getRequestMetadata(request);

    // Create audit logs for each update
    await Promise.all(
      successfulUpdates.map(async (result) => {
        if (!result) return;

        await createAuditLog({
          organizationId: access.organizationId,
          userId: user.userId,
          userSnapshot,
          action: "products.status_change",
          category: "PRODUCT",
          severity: "INFO",
          description: `${result.newStatus ? "เปิด" : "ปิด"}ใช้งานสินค้า ${
            result.productName
          } (${result.productCode})`,
          resourceId: result.productId,
          resourceType: "Product",
          payload: {
            productCode: result.productCode,
            productName: result.productName,
            previousStatus: result.previousStatus,
            newStatus: result.newStatus,
            batchUpdate: true,
          },
          ipAddress,
          userAgent,
        });
      })
    );

    // Create summary audit log for the batch operation
    await createAuditLog({
      organizationId: access.organizationId,
      userId: user.userId,
      userSnapshot,
      action: "products.batch_status_update",
      category: "PRODUCT",
      severity: "INFO",
      description: `อัปเดตสถานะสินค้าจำนวน ${successfulUpdates.length} รายการ`,
      payload: {
        totalRequested: updates.length,
        totalUpdated: successfulUpdates.length,
        totalSkipped: updateResults.filter((r) => r && r.skipped).length,
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      data: {
        totalRequested: updates.length,
        totalUpdated: successfulUpdates.length,
        totalSkipped: updateResults.filter((r) => r && r.skipped).length,
        updates: successfulUpdates,
      },
    });
  } catch (error) {
    console.error("Error in batch update status:", error);
    return NextResponse.json(
      { error: "Failed to update product status" },
      { status: 500 }
    );
  }
}
