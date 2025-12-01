// components/TransferManagement/TransferDetail/TransferItemsTab.tsx
// TransferItemsTab - Items tab content - UPDATED: Sort items alphabetically

'use client';

import { useMemo } from 'react';
import { TransferItem } from '@/types/transfer';
import TransferItemCard from './TransferItemCard';

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
}: TransferItemsTabProps) {
  // ✅ Sort items alphabetically by product code
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => 
      a.product.code.localeCompare(b.product.code, 'th')
    );
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">ไม่มีรายการสินค้า</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-2">
        รายการสินค้า {items.length} รายการ (เรียงตาม A-Z)
      </div>
      
      {sortedItems.map((item) => (
        <TransferItemCard
          key={item.id}
          item={item}
          userRole={userRole}
          canApprove={canApprove}
          canPrepare={canPrepare}
          canReceive={canReceive}
          canCancel={canCancel}
          onApprove={onApprove}
          onPrepare={onPrepare}
          onDeliver={onDeliver}
          onCancelItem={onCancelItem}
        />
      ))}
    </div>
  );
}