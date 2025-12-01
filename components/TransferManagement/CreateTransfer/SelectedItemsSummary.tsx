// components/TransferManagement/CreateTransfer/SelectedItemsSummary.tsx
// SelectedItemsSummary - UPDATED: Sort selected items alphabetically

'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface SelectedProduct {
  id: string;
  code: string;
  name: string;
  genericName?: string;
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
  // ✅ Sort selected products alphabetically by code
  const sortedProducts = useMemo(() => {
    return [...selectedProducts].sort((a, b) => 
      a.code.localeCompare(b.code, 'th')
    );
  }, [selectedProducts]);

  if (selectedProducts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          สินค้าที่เลือก ({selectedProducts.length} รายการ)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-600">
                    {product.code}
                  </span>
                  <span className="text-sm text-gray-900">{product.name}</span>
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  จำนวนเบิก: {product.quantity.toLocaleString()} {product.baseUnit}
                  {product.notes && ` • ${product.notes}`}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(product.id)}
                className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="text-sm text-gray-600">
            จำนวนสินค้าทั้งหมด: {selectedProducts.reduce((sum, p) => sum + p.quantity, 0).toLocaleString()} หน่วย
          </div>
        </div>
      </CardContent>
    </Card>
  );
}