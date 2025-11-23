// app/api/[orgSlug]/transfers/[transferId]/route.ts
// Transfer Detail API - Get & Cancel

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

    return NextResponse.json({
      success: true,
      data: transfer,
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