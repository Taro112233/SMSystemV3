// components/TransferManagement/TransferDetail/TransferItemsTable.tsx
// TransferItemsTable - UPDATED: Move notes to details, add note indicator icon, align status left

'use client';

import { useState } from 'react';
import { TransferItem, ApproveItemData, PrepareItemData, DeliverItemData, CancelItemData } from '@/types/transfer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, Truck, XCircle, Loader2, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import PrepareItemDialog from '../ItemActions/PrepareItemDialog';
import DeliverItemDialog from '../ItemActions/DeliverItemDialog';
import CancelItemDialog from '../ItemActions/CancelItemDialog';
import BatchDetailsRow from './BatchDetailsRow';
import { toast } from 'sonner';
import { Fragment } from 'react';

interface StockBatch {
  id: string;
  lotNumber: string;
  expiryDate?: Date;
  availableQuantity: number;
}

interface TransferItemsTableProps {
  items: TransferItem[];
  orgSlug: string;
  transferId: string;
  userRole: 'requesting' | 'supplying' | 'other';
  canApprove: boolean;
  canPrepare: boolean;
  canReceive: boolean;
  canCancel: boolean;
  onApprove: (itemId: string, data: ApproveItemData) => Promise<void>;
  onPrepare: (itemId: string, data: PrepareItemData) => Promise<void>;
  onDeliver: (itemId: string, data: DeliverItemData) => Promise<void>;
  onCancelItem: (itemId: string, data: CancelItemData) => Promise<void>;
}

export default function TransferItemsTable({
  items,
  orgSlug,
  transferId,
  userRole,
  canApprove,
  canPrepare,
  canReceive,
  canCancel,
  onApprove,
  onPrepare,
  onDeliver,
  onCancelItem,
}: TransferItemsTableProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [prepareDialogState, setPrepareDialogState] = useState<{
    open: boolean;
    item: TransferItem | null;
    batches: StockBatch[];
  }>({ open: false, item: null, batches: [] });
  const [deliverDialogState, setDeliverDialogState] = useState<{
    open: boolean;
    item: TransferItem | null;
  }>({ open: false, item: null });
  const [cancelDialogState, setCancelDialogState] = useState<{
    open: boolean;
    item: TransferItem | null;
  }>({ open: false, item: null });
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleApproveClick = async (item: TransferItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setLoadingStates(prev => ({ ...prev, [`approve-${item.id}`]: true }));
    try {
      await onApprove(item.id, {
        approvedQuantity: item.requestedQuantity,
        notes: undefined,
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [`approve-${item.id}`]: false }));
    }
  };

  const handlePrepareClick = async (item: TransferItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setLoadingStates(prev => ({ ...prev, [`prepare-${item.id}`]: true }));
    
    try {
      const pathParts = window.location.pathname.split('/');
      const deptSlug = pathParts[2];

      const stockResponse = await fetch(
        `/api/${orgSlug}/${deptSlug}/stocks?search=${item.product.code}`,
        { credentials: 'include' }
      );

      if (!stockResponse.ok) throw new Error('Failed to fetch stock');
      const stockData = await stockResponse.json();

      if (!stockData.success || !stockData.data || stockData.data.length === 0) {
        toast.error('ไม่พบสต็อก', { description: 'ไม่พบสต็อกสินค้านี้ในแผนก' });
        setPrepareDialogState({ open: true, item, batches: [] });
        return;
      }

      const stock = stockData.data[0];
      const batchesResponse = await fetch(
        `/api/${orgSlug}/${deptSlug}/stocks/${stock.id}/batches?availableOnly=true&forTransfer=true`,
        { credentials: 'include' }
      );

      if (!batchesResponse.ok) throw new Error('Failed to fetch batches');
      const batchesData = await batchesResponse.json();

      if (batchesData.success && batchesData.data) {
        setPrepareDialogState({ open: true, item, batches: batchesData.data });
        if (batchesData.data.length === 0) {
          toast.warning('ไม่มี Batch', { description: 'ไม่มี Batch ที่พร้อมใช้งานสำหรับสินค้านี้' });
        }
      } else {
        setPrepareDialogState({ open: true, item, batches: [] });
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('เกิดข้อผิดพลาด', { description: 'ไม่สามารถโหลดข้อมูล Batch ได้' });
      setPrepareDialogState({ open: true, item, batches: [] });
    } finally {
      setLoadingStates(prev => ({ ...prev, [`prepare-${item.id}`]: false }));
    }
  };

  const statusColors = {
    PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    APPROVED: 'bg-blue-50 text-blue-700 border-blue-200',
    PREPARED: 'bg-purple-50 text-purple-700 border-purple-200',
    DELIVERED: 'bg-green-50 text-green-700 border-green-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  };

  const statusLabels = {
    PENDING: 'รออนุมัติ',
    APPROVED: 'อนุมัติแล้ว',
    PREPARED: 'จัดเตรียมแล้ว',
    DELIVERED: 'รับเข้าแล้ว',
    CANCELLED: 'ยกเลิก',
  };

  const sortedItems = [...items].sort((a, b) => 
    a.product.code.localeCompare(b.product.code, 'th')
  );

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="w-10 px-4 py-3"></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  รหัสสินค้า
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  ชื่อสินค้า
                </th>
                {/* [EDIT] ปรับ text-center เป็น text-left */}
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  สถานะ
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                  ขอเบิก
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                  จัดเตรียม
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                  รับเข้า
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase w-40">
                  ดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedItems.map((item) => {
                const isExpanded = expandedItems.has(item.id);
                const hasBatches = item.batches && item.batches.length > 0;
                const hasNotes = item.notes || (item.status === 'CANCELLED' && item.cancelReason);
                const showApprove = canApprove && userRole === 'supplying' && item.status === 'PENDING';
                const showPrepare = canPrepare && userRole === 'supplying' && item.status === 'APPROVED';
                const showReceive = canReceive && userRole === 'requesting' && item.status === 'PREPARED';
                const showCancel = canCancel && item.status === 'PENDING';

                return (
                  <Fragment key={item.id}>
                    <tr 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleExpand(item.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {/* [EDIT] เอา FileText เดิมออก เหลือแค่ลูกศร */}
                          {(hasBatches || hasNotes) && (
                            <div className="text-gray-400">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-sm font-medium text-gray-900">
                          {item.product.code}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.product.name}
                            </div>
                            {item.product.genericName && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                {item.product.genericName}
                              </div>
                            )}
                          </div>
                          {/* [EDIT] เอา FileText เดิมออก */}
                        </div>
                      </td>
                      {/* [EDIT] ปรับ column สถานะ: text-left, ใส่ FileText ต่อท้าย Badge */}
                      <td className="px-4 py-3 text-left">
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className={`${statusColors[item.status]} text-xs font-medium`}>
                            {statusLabels[item.status]}
                          </Badge>
                          {hasNotes && (
                            <FileText className="h-3.5 w-3.5 text-blue-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {item.requestedQuantity.toLocaleString('th-TH')}
                        </div>
                        <div className="text-xs text-gray-500">{item.product.baseUnit}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {item.preparedQuantity !== null && item.preparedQuantity !== undefined ? (
                          <>
                            <div className="text-sm font-medium text-purple-900">
                              {item.preparedQuantity.toLocaleString('th-TH')}
                            </div>
                            <div className="text-xs text-gray-500">{item.product.baseUnit}</div>
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {item.receivedQuantity !== null && item.receivedQuantity !== undefined ? (
                          <>
                            <div className="text-sm font-medium text-green-900">
                              {item.receivedQuantity.toLocaleString('th-TH')}
                            </div>
                            <div className="text-xs text-gray-500">{item.product.baseUnit}</div>
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          {showApprove && (
                            <Button
                              size="sm"
                              onClick={(e) => handleApproveClick(item, e)}
                              disabled={loadingStates[`approve-${item.id}`]}
                              className="h-8 px-2 text-xs"
                            >
                              {loadingStates[`approve-${item.id}`] ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                          {showPrepare && (
                            <Button
                              size="sm"
                              onClick={(e) => handlePrepareClick(item, e)}
                              disabled={loadingStates[`prepare-${item.id}`]}
                              className="h-8 px-2 text-xs bg-purple-600 hover:bg-purple-700"
                            >
                              {loadingStates[`prepare-${item.id}`] ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Package className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                          {showReceive && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeliverDialogState({ open: true, item });
                              }}
                              className="h-8 px-2 text-xs bg-green-600 hover:bg-green-700"
                            >
                              <Truck className="h-3 w-3" />
                            </Button>
                          )}
                          {showCancel && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCancelDialogState({ open: true, item });
                              }}
                              className="h-8 px-2 text-xs"
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (hasBatches || hasNotes) && (
                      <BatchDetailsRow 
                        item={item} 
                        batches={item.batches || []} 
                      />
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {sortedItems.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            ไม่มีรายการสินค้า
          </div>
        )}
      </div>

      {prepareDialogState.item && (
        <PrepareItemDialog
          item={prepareDialogState.item}
          availableBatches={prepareDialogState.batches}
          open={prepareDialogState.open}
          onOpenChange={(open) => setPrepareDialogState({ open, item: null, batches: [] })}
          onPrepare={async (data) => {
            if (prepareDialogState.item) {
              await onPrepare(prepareDialogState.item.id, data);
            }
          }}
        />
      )}

      {deliverDialogState.item && (
        <DeliverItemDialog
          item={deliverDialogState.item}
          open={deliverDialogState.open}
          onOpenChange={(open) => setDeliverDialogState({ open, item: null })}
          onDeliver={async (data) => {
            if (deliverDialogState.item) {
              await onDeliver(deliverDialogState.item.id, data);
            }
          }}
        />
      )}

      {cancelDialogState.item && (
        <CancelItemDialog
          item={cancelDialogState.item}
          open={cancelDialogState.open}
          onOpenChange={(open) => setCancelDialogState({ open, item: null })}
          onCancel={async (data) => {
            if (cancelDialogState.item) {
              await onCancelItem(cancelDialogState.item.id, data);
            }
          }}
        />
      )}
    </>
  );
}