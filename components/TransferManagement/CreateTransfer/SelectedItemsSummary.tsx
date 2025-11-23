// components/TransferManagement/CreateTransfer/SelectedItemsSummary.tsx
// SelectedItemsSummary - Summary of selected products

'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SelectedProduct {
  id: string;
  code: string;
  name: string;
  baseUnit: string;
  quantity: number;
  notes?: string;
}

interface SelectedItemsSummaryProps {
  selectedProducts: SelectedProduct[];
  onRemove: (productId: string) => void;
}

export default function SelectedItemsSummary({
  selectedProducts,
  onRemove,
}: SelectedItemsSummaryProps) {
  if (selectedProducts.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
        ยังไม่ได้เลือกสินค้า
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">
        สินค้าที่เลือก ({selectedProducts.length} รายการ)
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {selectedProducts.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-900">
                  {product.code}
                </span>
                <span className="text-sm text-gray-700">{product.name}</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                จำนวน: {product.quantity} {product.baseUnit}
                {product.notes && ` • ${product.notes}`}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(product.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}