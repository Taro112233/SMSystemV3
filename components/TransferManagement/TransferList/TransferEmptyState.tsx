// components/TransferManagement/TransferList/TransferEmptyState.tsx
// TransferEmptyState - Empty state when no transfers

'use client';

import { Package } from 'lucide-react';

interface TransferEmptyStateProps {
  message?: string;
}

export default function TransferEmptyState({
  message = 'ยังไม่มีใบเบิกในระบบ',
}: TransferEmptyStateProps) {
  return (
    <div className="text-center py-12">
      <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  );
}