// components/TransferManagement/ItemActions/ApproveItemDialog.tsx
// ApproveItemDialog - UPDATED: One-click approval

'use client';

import { useEffect } from 'react';
import { TransferItem, ApproveItemData } from '@/types/transfer';

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
  // Auto-approve when dialog opens
  useEffect(() => {
    if (open) {
      // Approve with requested quantity immediately
      onApprove({
        approvedQuantity: item.requestedQuantity,
        notes: undefined,
      }).finally(() => {
        onOpenChange(false);
      });
    }
  }, [open, item.requestedQuantity, onApprove, onOpenChange]);

  // Dialog is now invisible and auto-closes
  return null;
}