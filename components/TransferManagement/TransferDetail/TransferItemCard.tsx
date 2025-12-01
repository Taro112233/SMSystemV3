// components/TransferManagement/TransferDetail/TransferItemCard.tsx
// TransferItemCard - Individual item card with actions - UPDATED: Sort batches by expiry date

'use client';

import { useState, useMemo } from 'react';
import { TransferItem } from '@/types/transfer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TransferStatusBadge from '../shared/TransferStatusBadge';
import QuantityDisplay from '../shared/QuantityDisplay';
import ApproveItemDialog from '../ItemActions/ApproveItemDialog';
import PrepareItemDialog from '../ItemActions/PrepareItemDialog';
import DeliverItemDialog from '../ItemActions/DeliverItemDialog';
import CancelItemDialog from '../ItemActions/CancelItemDialog';
import { CheckCircle, Package, Truck, XCircle, Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

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
  onApprove,
  onPrepare,
  onDeliver,
  onCancelItem,
}: TransferItemCardProps) {
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [prepareDialogOpen, setPrepareDialogOpen] = useState(false);
  const [deliverDialogOpen, setDeliverDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [batches, setBatches] = useState<StockBatch[]>([]);

  // ✅ Sort batches by expiry date (FIFO - earliest expiry first)
  const sortedBatches = useMemo(() => {
    if (!item.batches || item.batches.length === 0) return [];
    
    return [...item.batches].sort((a, b) => {
      // Batches without expiry date go to the end
      if (!a.batch.expiryDate && !b.batch.expiryDate) return 0;
      if (!a.batch.expiryDate) return 1;
      if (!b.batch.expiryDate) return -1;
      
      return new Date(a.batch.expiryDate).getTime() - new Date(b.batch.expiryDate).getTime();
    });
  }, [item.batches]);

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

  const handlePrepareClick = async () => {
    setLoadingBatches(true);
    
    try {
      const pathParts = window.location.pathname.split('/');
      const orgSlug = pathParts[1];
      const deptSlug = pathParts[2];

      const stockResponse = await fetch(
        `/api/${orgSlug}/${deptSlug}/stocks?search=${item.product.code}`,
        { credentials: 'include' }
      );

      if (!stockResponse.ok) {
        throw new Error('Failed to fetch stock');
      }

      const stockData = await stockResponse.json();

      if (!stockData.success || !stockData.data || stockData.data.length === 0) {
        toast.error('ไม่พบสต็อก', {
          description: 'ไม่พบสต็อกสินค้านี้ในแผนก',
        });
        setBatches([]);
        setPrepareDialogOpen(true);
        return;
      }

      const stock = stockData.data[0];

      const batchesResponse = await fetch(
        `/api/${orgSlug}/${deptSlug}/stocks/${stock.id}/batches?availableOnly=true&forTransfer=true`,
        { credentials: 'include' }
      );

      if (!batchesResponse.ok) {
        throw new Error('Failed to fetch batches');
      }

      const batchesData = await batchesResponse.json();

      if (batchesData.success && batchesData.data) {
        setBatches(batchesData.data);
        
        if (batchesData.data.length === 0) {
          toast.warning('ไม่มี Batch', {
            description: 'ไม่มี Batch ที่พร้อมใช้งานสำหรับสินค้านี้',
          });
        }
      } else {
        setBatches([]);
      }

      setPrepareDialogOpen(true);
    } catch (error) {
      console.error('❌ Error fetching batches:', error);
      toast.error('เกิดข้อผิดพลาด', {
        description: 'ไม่สามารถโหลดข้อมูล Batch ได้',
      });
      setBatches([]);
      setPrepareDialogOpen(true);
    } finally {
      setLoadingBatches(false);
    }
  };

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

  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Header Section */}
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
                
                {/* Request & Approval Info */}
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">จำนวนที่ขอ:</span>
                    <QuantityDisplay
                      quantity={item.requestedQuantity}
                      unit={item.product.baseUnit}
                      className="font-semibold text-gray-900"
                    />
                  </div>
                  {item.approvedQuantity !== undefined && item.approvedQuantity !== null && (
                    <>
                      <span className="text-gray-300">→</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">จำนวนที่อนุมัติ:</span>
                        <QuantityDisplay
                          quantity={item.approvedQuantity}
                          unit={item.product.baseUnit}
                          className="font-semibold text-blue-900"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
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
                    onClick={handlePrepareClick}
                    size="sm"
                    className="gap-1 bg-purple-600 hover:bg-purple-700"
                    disabled={loadingBatches}
                  >
                    {loadingBatches ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Package className="h-4 w-4" />
                    )}
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

            {/* Batch Details Table - UPDATED: Use sortedBatches */}
            {sortedBatches.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <div className="text-xs font-semibold text-gray-700 uppercase">
                    Batch Details (เรียงตามวันหมดอายุ - FIFO)
                  </div>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Lot Number
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        วันหมดอายุ
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                        จำนวนจัดเตรียม
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                        จำนวนรับเข้า
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                        สถานะ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedBatches.map((batch) => (
                      <tr key={batch.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {batch.batch.lotNumber}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            {formatDate(batch.batch.expiryDate)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          {item.status === 'PREPARED' || item.status === 'DELIVERED' ? (
                            <QuantityDisplay
                              quantity={batch.quantity}
                              unit={item.product.baseUnit}
                              className="font-medium text-purple-900"
                            />
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          {item.status === 'DELIVERED' ? (
                            <QuantityDisplay
                              quantity={batch.quantity}
                              unit={item.product.baseUnit}
                              className="font-medium text-green-900"
                            />
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {item.status === 'DELIVERED' ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              รับเข้าแล้ว
                            </Badge>
                          ) : item.status === 'PREPARED' ? (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                              จัดเตรียมแล้ว
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-600">
                              รอดำเนินการ
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-gray-700">
                        รวม
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        {item.preparedQuantity !== undefined && item.preparedQuantity !== null ? (
                          <QuantityDisplay
                            quantity={item.preparedQuantity}
                            unit={item.product.baseUnit}
                            className="font-semibold text-purple-900"
                          />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        {item.receivedQuantity !== undefined && item.receivedQuantity !== null ? (
                          <QuantityDisplay
                            quantity={item.receivedQuantity}
                            unit={item.product.baseUnit}
                            className="font-semibold text-green-900"
                          />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Notes Section */}
            {item.notes && (
              <div className="pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-600 mb-1">หมายเหตุ</div>
                <div className="text-sm text-gray-900 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  {item.notes}
                </div>
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
        availableBatches={batches}
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