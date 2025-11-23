// components/TransferManagement/ItemActions/CancelItemDialog.tsx
// CancelItemDialog - Cancel item modal

'use client';

import { useState } from 'react';
import { TransferItem, CancelItemData } from '@/types/transfer';
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
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface CancelItemDialogProps {
  item: TransferItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: (data: CancelItemData) => Promise<void>;
}

export default function CancelItemDialog({
  item,
  open,
  onOpenChange,
  onCancel,
}: CancelItemDialogProps) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('กรุณาระบุเหตุผล', {
        description: 'จำเป็นต้องระบุเหตุผลในการยกเลิก',
      });
      return;
    }

    setLoading(true);

    try {
      await onCancel({ reason });
      onOpenChange(false);
      setReason('');
    } catch (error) {
      console.error('Error cancelling item:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle>ยกเลิกรายการ</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Product Info */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
            <div className="text-xs text-gray-600 mt-1">
              รหัส: {item.product.code} • สถานะ: {item.status}
            </div>
          </div>

          {/* Warning */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>คำเตือน:</strong> การยกเลิกรายการนี้จะไม่สามารถกู้คืนได้
            </p>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              เหตุผลในการยกเลิก <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ระบุเหตุผลในการยกเลิก"
              rows={4}
              disabled={loading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            ยกเลิก
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                กำลังยกเลิก...
              </>
            ) : (
              'ยืนยันการยกเลิก'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}