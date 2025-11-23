// components/TransferManagement/TransferDetail/TransferItemsTab.tsx
// TransferItemsTab - Items tab content

'use client';

import { TransferItem } from '@/types/transfer';
import TransferItemCard from './TransferItemCard';

interface StockBatch {
  id: string;
  lotNumber: string;
  expiryDate?: Date;
  availableQuantity: number;
}

interface TransferItemsTabProps {
  items: TransferItem[];
  userRole: 'requesting' | 'supplying' | 'other';
  canApprove: boolean;
  canPrepare: boolean;
  canReceive: boolean;
  canCancel: boolean;
  onApprove: (itemId: string, data: any) => Promise<void>;
  onPrepare: (itemId: string, data: any) => Promise<void>;
  onDeliver: (itemId: string, data: any) => Promise<void>;
  onCancelItem: (itemId: string, data: any) => Promise<void>;
  getBatchesForItem?: (itemId: string) => StockBatch[];
}

export default function TransferItemsTab({
  items,
  userRole,
  canApprove,
  canPrepare,
  canReceive,
  canCancel,
  onApprove,
  onPrepare,
  onDeliver,
  onCancelItem,
  getBatchesForItem = () => [],
}: TransferItemsTabProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">ไม่มีรายการสินค้า</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <TransferItemCard
          key={item.id}
          item={item}
          userRole={userRole}
          canApprove={canApprove}
          canPrepare={canPrepare}
          canReceive={canReceive}
          canCancel={canCancel}
          availableBatches={getBatchesForItem(item.id)}
          onApprove={onApprove}
          onPrepare={onPrepare}
          onDeliver={onDeliver}
          onCancelItem={onCancelItem}
        />
      ))}
    </div>
  );
}