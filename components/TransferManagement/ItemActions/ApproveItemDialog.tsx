// components/TransferManagement/ItemActions/ApproveItemDialog.tsx
// ApproveItemDialog - Approve item modal

'use client';

import { useState } from 'react';
import { TransferItem, ApproveItemData } from '@/types/transfer';
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

interface ApproveItemDialogProps {
  item: TransferItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (data: ApproveItemData) => Promise<void>;
}

export default function ApproveItemDialog({
  item,
  open,
  onOpenChange,
  onApprove,
}: ApproveItemDialogProps) {
  const [loading, setLoading] = useState(false);
  const [approvedQuantity, setApprovedQuantity] = useState(item.requestedQuantity);
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (approvedQuantity <= 0 || approvedQuantity > item.requestedQuantity) {
      toast.error('จำนวนไม่ถูกต้อง', {
        description: 'กรุณาระบุจำนวนระหว่าง 1 ถึง ' + item.requestedQuantity,
      });
      return;
    }

    setLoading(true);

    try {
      await onApprove({ approvedQuantity, notes: notes || undefined });
      onOpenChange(false);
      setNotes('');
    } catch (error) {
      console.error('Error approving item:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>อนุมัติรายการ</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Product Info */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
            <div className="text-xs text-gray-600 mt-1">
              รหัส: {item.product.code}
            </div>
          </div>

          {/* Requested Quantity */}
          <div className="space-y-2">
            <Label>จำนวนที่ขอเบิก</Label>
            <div className="text-lg font-semibold text-gray-900">
              {item.requestedQuantity.toLocaleString('th-TH')} {item.product.baseUnit}
            </div>
          </div>

          {/* Approved Quantity */}
          <div className="space-y-2">
            <Label htmlFor="approvedQuantity">
              จำนวนที่อนุมัติ <span className="text-red-500">*</span>
            </Label>
            <Input
              id="approvedQuantity"
              type="number"
              min="1"
              max={item.requestedQuantity}
              value={approvedQuantity}
              onChange={(e) => setApprovedQuantity(parseInt(e.target.value) || 0)}
              disabled={loading}
            />
            <div className="text-xs text-gray-500">
              สูงสุด: {item.requestedQuantity.toLocaleString('th-TH')} {item.product.baseUnit}
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
                กำลังอนุมัติ...
              </>
            ) : (
              'อนุมัติ'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}