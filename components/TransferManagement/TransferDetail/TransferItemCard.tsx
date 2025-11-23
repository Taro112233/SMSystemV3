// components/TransferManagement/TransferDetail/TransferItemCard.tsx
// TransferItemCard - Individual item card with actions

'use client';

import { useState } from 'react';
import { TransferItem } from '@/types/transfer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TransferStatusBadge from '../shared/TransferStatusBadge';
import QuantityDisplay from '../shared/QuantityDisplay';
import BatchInfoDisplay from '../ItemActions/BatchInfoDisplay';
import ApproveItemDialog from '../ItemActions/ApproveItemDialog';
import PrepareItemDialog from '../ItemActions/PrepareItemDialog';
import DeliverItemDialog from '../ItemActions/DeliverItemDialog';
import CancelItemDialog from '../ItemActions/CancelItemDialog';
import { CheckCircle, Package, Truck, XCircle } from 'lucide-react';

interface StockBatch {
  id: string;
  lotNumber: string;
  expiryDate?: Date;
  availableQuantity: number;
}

interface TransferItemCardProps {
  item: TransferItem;
  userRole: 'requesting' | 'supplying' | 'other';
  canApprove: boolean;
  canPrepare: boolean;
  canReceive: boolean;
  canCancel: boolean;
  availableBatches?: StockBatch[];
  onApprove: (itemId: string, data: any) => Promise<void>;
  onPrepare: (itemId: string, data: any) => Promise<void>;
  onDeliver: (itemId: string, data: any) => Promise<void>;
  onCancelItem: (itemId: string, data: any) => Promise<void>;
}

export default function TransferItemCard({
  item,
  userRole,
  canApprove,
  canPrepare,
  canReceive,
  canCancel,
  availableBatches = [],
  onApprove,
  onPrepare,
  onDeliver,
  onCancelItem,
}: TransferItemCardProps) {
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [prepareDialogOpen, setPrepareDialogOpen] = useState(false);
  const [deliverDialogOpen, setDeliverDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const showApproveButton = 
    canApprove && 
    userRole === 'supplying' && 
    item.status === 'PENDING';

  const showPrepareButton = 
    canPrepare && 
    userRole === 'supplying' && 
    item.status === 'APPROVED';

  const showReceiveButton = 
    canReceive && 
    userRole === 'requesting' && 
    item.status === 'PREPARED';

  const showCancelButton = 
    canCancel && 
    item.status !== 'DELIVERED' && 
    item.status !== 'CANCELLED';

  const handleApprove = async (data: any) => {
    await onApprove(item.id, data);
  };

  const handlePrepare = async (data: any) => {
    await onPrepare(item.id, data);
  };

  const handleDeliver = async (data: any) => {
    await onDeliver(item.id, data);
  };

  const handleCancel = async (data: any) => {
    await onCancelItem(item.id, data);
  };

  return (
    <>
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {item.product.name}
                  </h4>
                  <TransferStatusBadge status={item.status} />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {item.product.code}
                  </Badge>
                  {item.product.genericName && (
                    <span className="text-sm text-gray-600">
                      ({item.product.genericName})
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {showApproveButton && (
                  <Button
                    onClick={() => setApproveDialogOpen(true)}
                    size="sm"
                    className="gap-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="h-4 w-4" />
                    อนุมัติ
                  </Button>
                )}

                {showPrepareButton && (
                  <Button
                    onClick={() => setPrepareDialogOpen(true)}
                    size="sm"
                    className="gap-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Package className="h-4 w-4" />
                    จัดเตรียม
                  </Button>
                )}

                {showReceiveButton && (
                  <Button
                    onClick={() => setDeliverDialogOpen(true)}
                    size="sm"
                    className="gap-1 bg-green-600 hover:bg-green-700"
                  >
                    <Truck className="h-4 w-4" />
                    รับเข้า
                  </Button>
                )}

                {showCancelButton && (
                  <Button
                    onClick={() => setCancelDialogOpen(true)}
                    size="sm"
                    variant="destructive"
                    className="gap-1"
                  >
                    <XCircle className="h-4 w-4" />
                    ยกเลิก
                  </Button>
                )}
              </div>
            </div>

            {/* Quantities Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-xs text-gray-600 mb-1">จำนวนที่ขอ</div>
                <QuantityDisplay
                  quantity={item.requestedQuantity}
                  unit={item.product.baseUnit}
                  className="text-sm font-semibold text-gray-900"
                />
              </div>

              {item.approvedQuantity !== undefined && (
                <div>
                  <div className="text-xs text-gray-600 mb-1">จำนวนที่อนุมัติ</div>
                  <QuantityDisplay
                    quantity={item.approvedQuantity}
                    unit={item.product.baseUnit}
                    className="text-sm font-semibold text-blue-900"
                  />
                </div>
              )}

              {item.preparedQuantity !== undefined && (
                <div>
                  <div className="text-xs text-gray-600 mb-1">จำนวนที่จัดเตรียม</div>
                  <QuantityDisplay
                    quantity={item.preparedQuantity}
                    unit={item.product.baseUnit}
                    className="text-sm font-semibold text-purple-900"
                  />
                </div>
              )}

              {item.receivedQuantity !== undefined && (
                <div>
                  <div className="text-xs text-gray-600 mb-1">จำนวนที่รับเข้า</div>
                  <QuantityDisplay
                    quantity={item.receivedQuantity}
                    unit={item.product.baseUnit}
                    className="text-sm font-semibold text-green-900"
                  />
                </div>
              )}
            </div>

            {/* Batches Info */}
            {item.batches && item.batches.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <BatchInfoDisplay 
                  batches={item.batches} 
                  baseUnit={item.product.baseUnit} 
                />
              </div>
            )}

            {/* Notes */}
            {item.notes && (
              <div className="pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-600 mb-1">หมายเหตุ</div>
                <div className="text-sm text-gray-900">{item.notes}</div>
              </div>
            )}

            {/* Cancel Reason */}
            {item.status === 'CANCELLED' && item.cancelReason && (
              <div className="pt-4 border-t border-gray-200">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-xs text-red-700 font-medium mb-1">
                    เหตุผลในการยกเลิก
                  </div>
                  <div className="text-sm text-red-900">{item.cancelReason}</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ApproveItemDialog
        item={item}
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        onApprove={handleApprove}
      />

      <PrepareItemDialog
        item={item}
        availableBatches={availableBatches}
        open={prepareDialogOpen}
        onOpenChange={setPrepareDialogOpen}
        onPrepare={handlePrepare}
      />

      <DeliverItemDialog
        item={item}
        open={deliverDialogOpen}
        onOpenChange={setDeliverDialogOpen}
        onDeliver={handleDeliver}
      />

      <CancelItemDialog
        item={item}
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onCancel={handleCancel}
      />
    </>
  );
}