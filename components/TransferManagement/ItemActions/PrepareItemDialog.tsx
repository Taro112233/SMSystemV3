// components/TransferManagement/ItemActions/PrepareItemDialog.tsx
// PrepareItemDialog - Prepare item modal

'use client';

import { useState, useEffect } from 'react';
import { TransferItem, PrepareItemData } from '@/types/transfer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import BatchSelectionTable from './BatchSelectionTable';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface StockBatch {
  id: string;
  lotNumber: string;
  expiryDate?: Date;
  availableQuantity: number;
}

interface SelectedBatchItem {
  batchId: string;
  quantity: number;
}

interface PrepareItemDialogProps {
  item: TransferItem;
  availableBatches: StockBatch[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrepare: (data: PrepareItemData) => Promise<void>;
}

export default function PrepareItemDialog({
  item,
  availableBatches,
  open,
  onOpenChange,
  onPrepare,
}: PrepareItemDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedBatches, setSelectedBatches] = useState<SelectedBatchItem[]>([]);
  const [notes, setNotes] = useState('');

  const maxQuantity = item.approvedQuantity || 0;

  useEffect(() => {
    if (open) {
      setSelectedBatches([]);
      setNotes('');
    }
  }, [open]);

  const getTotalSelected = () => {
    return selectedBatches.reduce((sum: number, b: SelectedBatchItem) => sum + b.quantity, 0);
  };

  const handleSubmit = async () => {
    const totalSelected = getTotalSelected();

    if (totalSelected === 0) {
      toast.error('ยังไม่ได้เลือก Batch', {
        description: 'กรุณาเลือก Batch และระบุจำนวน',
      });
      return;
    }

    if (totalSelected > maxQuantity) {
      toast.error('จำนวนเกินกำหนด', {
        description: 'จำนวนที่เลือกเกินจำนวนที่อนุมัติ',
      });
      return;
    }

    setLoading(true);

    try {
      await onPrepare({
        preparedQuantity: totalSelected,
        batches: selectedBatches,
        notes: notes || undefined,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error preparing item:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>จัดเตรียมรายการ</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Product Info */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
            <div className="text-xs text-gray-600 mt-1">
              รหัส: {item.product.code} • อนุมัติแล้ว: {maxQuantity.toLocaleString('th-TH')}{' '}
              {item.product.baseUnit}
            </div>
          </div>

          {/* Batch Selection */}
          <div className="space-y-2">
            <Label>เลือก Batch และระบุจำนวนที่จะจ่าย</Label>
            <BatchSelectionTable
              batches={availableBatches}
              selectedBatches={selectedBatches}
              maxQuantity={maxQuantity}
              baseUnit={item.product.baseUnit}
              onChange={setSelectedBatches}
            />
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
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                กำลังจัดเตรียม...
              </>
            ) : (
              'จัดเตรียม'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}