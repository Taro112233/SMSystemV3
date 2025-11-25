// components/TransferManagement/ItemActions/DeliverItemDialog.tsx
// DeliverItemDialog - Receive/deliver item modal with batch-level input

'use client';

import { useState, useEffect } from 'react';
import { TransferItem, DeliverItemData } from '@/types/transfer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeliverItemDialogProps {
  item: TransferItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeliver: (data: DeliverItemData) => Promise<void>;
}

interface BatchDeliveryInput {
  batchId: string;
  lotNumber: string;
  preparedQuantity: number;
  receivedQuantity: number;
}

export default function DeliverItemDialog({
  item,
  open,
  onOpenChange,
  onDeliver,
}: DeliverItemDialogProps) {
  const [loading, setLoading] = useState(false);
  const [batchInputs, setBatchInputs] = useState<BatchDeliveryInput[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open && item.batches) {
      // Initialize batch inputs with prepared quantities
      const initialInputs: BatchDeliveryInput[] = item.batches.map(b => ({
        batchId: b.batchId,
        lotNumber: b.batch.lotNumber,
        preparedQuantity: b.quantity,
        receivedQuantity: b.quantity, // Default to full prepared quantity
      }));
      setBatchInputs(initialInputs);
    }
  }, [open, item.batches]);

  const getTotalPrepared = () => {
    return batchInputs.reduce((sum, b) => sum + b.preparedQuantity, 0);
  };

  const getTotalReceived = () => {
    return batchInputs.reduce((sum, b) => sum + b.receivedQuantity, 0);
  };

  const handleBatchQuantityChange = (batchId: string, value: number) => {
    setBatchInputs(prev =>
      prev.map(b =>
        b.batchId === batchId
          ? { ...b, receivedQuantity: Math.min(Math.max(0, value), b.preparedQuantity) }
          : b
      )
    );
  };

  const handleSubmit = async () => {
    const totalReceived = getTotalReceived();

    if (totalReceived === 0) {
      toast.error('กรุณาระบุจำนวนที่รับเข้า', {
        description: 'ต้องระบุจำนวนอย่างน้อย 1 รายการ',
      });
      return;
    }

    // Validate each batch
    const invalidBatch = batchInputs.find(
      b => b.receivedQuantity < 0 || b.receivedQuantity > b.preparedQuantity
    );

    if (invalidBatch) {
      toast.error('จำนวนไม่ถูกต้อง', {
        description: `Lot ${invalidBatch.lotNumber} ต้องระหว่าง 0 ถึง ${invalidBatch.preparedQuantity}`,
      });
      return;
    }

    setLoading(true);

    try {
      await onDeliver({
        receivedQuantity: totalReceived,
        batchDeliveries: batchInputs.map(b => ({
          batchId: b.batchId,
          receivedQuantity: b.receivedQuantity,
        })),
        notes: notes || undefined,
      });
      onOpenChange(false);
      setNotes('');
    } catch (error) {
      console.error('Error delivering item:', error);
    } finally {
      setLoading(false);
    }
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>รับเข้ารายการ</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Product Info */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
            <div className="text-xs text-gray-600 mt-1">
              รหัส: {item.product.code}
            </div>
          </div>

          {/* Batch-level Input Table */}
          <div className="space-y-2">
            <Label>ระบุจำนวนที่รับเข้าแต่ละ Batch</Label>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                      Lot Number
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                      วันหมดอายุ
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                      จำนวนที่จัดเตรียม
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                      จำนวนที่รับเข้า
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {batchInputs.map((batch) => (
                    <tr key={batch.batchId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {batch.lotNumber}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600">
                          {formatDate(item.batches?.find(b => b.batchId === batch.batchId)?.batch.expiryDate)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {batch.preparedQuantity.toLocaleString('th-TH')}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min="0"
                          max={batch.preparedQuantity}
                          value={batch.receivedQuantity}
                          onChange={(e) =>
                            handleBatchQuantityChange(
                              batch.batchId,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="text-right"
                          disabled={loading}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-semibold">
                  <tr>
                    <td colSpan={2} className="px-4 py-3 text-sm text-gray-700">
                      รวม
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-purple-900">
                      {getTotalPrepared().toLocaleString('th-TH')} {item.product.baseUnit}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-green-900">
                      {getTotalReceived().toLocaleString('th-TH')} {item.product.baseUnit}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="text-xs text-gray-500">
              * ระบุจำนวนที่รับเข้าแต่ละ Batch (สามารถรับไม่ครบก็ได้)
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">หมายเหตุ</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
              rows={3}
              disabled={loading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit} disabled={loading || getTotalReceived() === 0}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                กำลังรับเข้า...
              </>
            ) : (
              `รับเข้า ${getTotalReceived().toLocaleString('th-TH')} ${item.product.baseUnit}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}