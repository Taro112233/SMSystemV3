// components/TransferManagement/ItemActions/DeliverItemDialog.tsx
// DeliverItemDialog - Receive/deliver item modal

'use client';

import { useState } from 'react';
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
import BatchInfoDisplay from './BatchInfoDisplay';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeliverItemDialogProps {
  item: TransferItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeliver: (data: DeliverItemData) => Promise<void>;
}

export default function DeliverItemDialog({
  item,
  open,
  onOpenChange,
  onDeliver,
}: DeliverItemDialogProps) {
  const [loading, setLoading] = useState(false);
  const [receivedQuantity, setReceivedQuantity] = useState(item.preparedQuantity || 0);
  const [notes, setNotes] = useState('');

  const maxQuantity = item.preparedQuantity || 0;

  const handleSubmit = async () => {
    if (receivedQuantity <= 0 || receivedQuantity > maxQuantity) {
      toast.error('จำนวนไม่ถูกต้อง', {
        description: 'กรุณาระบุจำนวนระหว่าง 1 ถึง ' + maxQuantity,
      });
      return;
    }

    setLoading(true);

    try {
      await onDeliver({ receivedQuantity, notes: notes || undefined });
      onOpenChange(false);
      setNotes('');
    } catch (error) {
      console.error('Error delivering item:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
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

          {/* Prepared Quantity */}
          <div className="space-y-2">
            <Label>จำนวนที่จัดเตรียม</Label>
            <div className="text-lg font-semibold text-purple-900">
              {maxQuantity.toLocaleString('th-TH')} {item.product.baseUnit}
            </div>
          </div>

          {/* Batches Info */}
          {item.batches && item.batches.length > 0 && (
            <BatchInfoDisplay batches={item.batches} baseUnit={item.product.baseUnit} />
          )}

          {/* Received Quantity */}
          <div className="space-y-2">
            <Label htmlFor="receivedQuantity">
              จำนวนที่รับเข้า <span className="text-red-500">*</span>
            </Label>
            <Input
              id="receivedQuantity"
              type="number"
              min="1"
              max={maxQuantity}
              value={receivedQuantity}
              onChange={(e) => setReceivedQuantity(parseInt(e.target.value) || 0)}
              disabled={loading}
            />
            <div className="text-xs text-gray-500">
              สูงสุด: {maxQuantity.toLocaleString('th-TH')} {item.product.baseUnit}
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
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                กำลังรับเข้า...
              </>
            ) : (
              'รับเข้า'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}