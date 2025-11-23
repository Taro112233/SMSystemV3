// app/api/[orgSlug]/transfers/[transferId]/approve-item/route.ts
// Approve Transfer Item API

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { approveTransferItem } from '@/lib/transfer-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string; transferId: string }> }
) {
  try {
    const { orgSlug } = await params;

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

    const body = await request.json();
    const { itemId, approvedQuantity, notes } = body;

    if (!itemId || !approvedQuantity || approvedQuantity <= 0) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const updatedItem = await approveTransferItem({
      itemId,
      approvedQuantity,
      notes,
      approvedBy: user.userId,
    });

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: 'Item approved successfully',
    });
  } catch (error) {
    console.error('Approve item failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}