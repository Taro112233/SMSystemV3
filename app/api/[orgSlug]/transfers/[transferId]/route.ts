// app/api/[orgSlug]/transfers/[transferId]/route.ts
// Transfer Detail API - Get & Cancel - FIXED

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { getTransferWithDetails, cancelTransfer } from '@/lib/transfer-helpers';

// GET - Get transfer detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; transferId: string }> }
) {
  try {
    const { orgSlug, transferId } = await params;

    const user = getUserFromHeaders(request.headers);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const access = await getUserOrgRole(user.userId, orgSlug);
    if (!access) {
      return NextResponse.json(
        { error: 'No access to organization' },
        { status: 403 }
      );
    }

    const transfer = await getTransferWithDetails(transferId);

    if (!transfer || transfer.organizationId !== access.organizationId) {
      return NextResponse.json(
        { error: 'Transfer not found' },
        { status: 404 }
      );
    }

    // ✅ FIXED: Format response เหมือน API อื่นๆ
    const formattedTransfer = {
      id: transfer.id,
      code: transfer.code,
      title: transfer.title,
      organizationId: transfer.organizationId,
      requestingDepartmentId: transfer.requestingDepartmentId,
      requestingDepartment: transfer.requestingDepartment,
      supplyingDepartmentId: transfer.supplyingDepartmentId,
      supplyingDepartment: transfer.supplyingDepartment,
      status: transfer.status,
      priority: transfer.priority,
      requestReason: transfer.requestReason,
      notes: transfer.notes,
      requestedAt: transfer.requestedAt,
      approvedAt: transfer.approvedAt,
      preparedAt: transfer.preparedAt,
      deliveredAt: transfer.deliveredAt,
      cancelledAt: transfer.cancelledAt,
      cancelReason: transfer.cancelReason,
      requestedBy: transfer.requestedBy,
      requestedBySnapshot: transfer.requestedBySnapshot,
      createdAt: transfer.createdAt,
      updatedAt: transfer.updatedAt,
      // ✅ Include items with proper formatting
      items: transfer.items.map(item => ({
        id: item.id,
        transferId: item.transferId,
        productId: item.productId,
        product: {
          id: item.product.id,
          code: item.product.code,
          name: item.product.name,
          genericName: item.product.genericName,
          baseUnit: item.product.baseUnit,
        },
        status: item.status,
        requestedQuantity: item.requestedQuantity,
        approvedQuantity: item.approvedQuantity,
        preparedQuantity: item.preparedQuantity,
        receivedQuantity: item.receivedQuantity,
        notes: item.notes,
        cancelReason: item.cancelReason,
        approvedAt: item.approvedAt,
        preparedAt: item.preparedAt,
        deliveredAt: item.deliveredAt,
        cancelledAt: item.cancelledAt,
        // ✅ Include batches if exist
        batches: item.batches?.map(batch => ({
          id: batch.id,
          transferItemId: batch.transferItemId,
          batchId: batch.batchId,
          batch: {
            id: batch.batch.id,
            lotNumber: batch.batch.lotNumber,
            expiryDate: batch.batch.expiryDate,
          },
          quantity: batch.quantity,
        })) || [],
      })),
      // ✅ Include status history
      statusHistory: transfer.statusHistory?.map(history => ({
        id: history.id,
        transferId: history.transferId,
        itemId: history.itemId,
        action: history.action,
        fromStatus: history.fromStatus,
        toStatus: history.toStatus,
        changedBy: history.changedBy,
        changedBySnapshot: history.changedBySnapshot,
        notes: history.notes,
        createdAt: history.createdAt,
      })) || [],
    };

    return NextResponse.json({
      success: true,
      data: formattedTransfer,
    });
  } catch (error) {
    console.error('Get transfer detail failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel transfer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; transferId: string }> }
) {
  try {
    const { orgSlug, transferId } = await params;

    const user = getUserFromHeaders(request.headers);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const access = await getUserOrgRole(user.userId, orgSlug);
    if (!access) {
      return NextResponse.json(
        { error: 'No access to organization' },
        { status: 403 }
      );
    }

    // Check permissions
    if (!['ADMIN', 'OWNER'].includes(access.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. ADMIN or OWNER required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json(
        { error: 'Cancellation reason is required' },
        { status: 400 }
      );
    }

    await cancelTransfer(transferId, reason, user.userId);

    return NextResponse.json({
      success: true,
      message: 'Transfer cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel transfer failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}