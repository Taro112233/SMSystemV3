// app/api/[orgSlug]/transfers/[transferId]/deliver-item/route.ts
// Deliver Transfer Item API - FIXED with batch deliveries

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders, getUserOrgRole } from '@/lib/auth-server';
import { deliverTransferItem } from '@/lib/transfer-helpers';

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
    const { itemId, receivedQuantity, batchDeliveries, notes } = body;

    // ✅ Validation
    if (!itemId || !receivedQuantity || receivedQuantity <= 0) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // ✅ Validate batch deliveries
    if (!batchDeliveries || !Array.isArray(batchDeliveries) || batchDeliveries.length === 0) {
      return NextResponse.json(
        { error: 'Batch deliveries are required' },
        { status: 400 }
      );
    }

    const updatedItem = await deliverTransferItem({
      itemId,
      receivedQuantity,
      batchDeliveries,  // ✅ Include batch deliveries
      notes,
      deliveredBy: user.userId,
    });

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: 'Item delivered successfully',
    });
  } catch (error) {
    console.error('Deliver item failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}