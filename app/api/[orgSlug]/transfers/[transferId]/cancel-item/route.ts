// app/api/[orgSlug]/transfers/[transferId]/cancel-item/route.ts
// Cancel Transfer Item API

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { cancelTransferItem } from '@/lib/transfer-helpers';

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

    // Check permissions
    if (!['ADMIN', 'OWNER'].includes(access.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. ADMIN or OWNER required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { itemId, reason } = body;

    if (!itemId || !reason) {
      return NextResponse.json(
        { error: 'Item ID and reason are required' },
        { status: 400 }
      );
    }

    const updatedItem = await cancelTransferItem(itemId, reason, user.userId);

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: 'Item cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel item failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}