// components/TransferManagement/ItemActions/BatchInfoDisplay.tsx
// BatchInfoDisplay - Display selected batches (read-only)

'use client';

import { TransferBatch } from '@/types/transfer';
import { Badge } from '@/components/ui/badge';

interface BatchInfoDisplayProps {
  batches: TransferBatch[];
  baseUnit: string;
}

export default function BatchInfoDisplay({ batches, baseUnit }: BatchInfoDisplayProps) {
  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (batches.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-4">
        ยังไม่มีข้อมูล Batch
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">Batch ที่เลือก:</div>
      <div className="space-y-2">
        {batches.map((batch) => (
          <div
            key={batch.id}
            className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-purple-900">
                  {batch.batch.lotNumber}
                </span>
                {batch.batch.expiryDate && (
                  <Badge variant="outline" className="bg-white text-xs">
                    EXP: {formatDate(batch.batch.expiryDate)}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-sm font-semibold text-purple-900">
              {batch.quantity.toLocaleString('th-TH')} {baseUnit}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-purple-200">
        <span className="text-sm font-medium text-gray-700">รวมทั้งหมด:</span>
        <span className="text-sm font-bold text-gray-900">
          {batches.reduce((sum, b) => sum + b.quantity, 0).toLocaleString('th-TH')} {baseUnit}
        </span>
      </div>
    </div>
  );
}