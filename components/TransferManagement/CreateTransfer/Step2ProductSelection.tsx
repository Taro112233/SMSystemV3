// components/TransferManagement/CreateTransfer/Step2ProductSelection.tsx
// Step2ProductSelection - UPDATED: Remove requestingCurrentStock

'use client';

import ProductSelectionTable from './ProductSelectionTable';
import SelectedItemsSummary from './SelectedItemsSummary';

interface ProductStock {
  stockId?: string;
  availableQuantity: number;
  lastUpdated: Date;
}

interface Product {
  id: string;
  code: string;
  name: string;
  genericName?: string;
  baseUnit: string;
  defaultWithdrawalQty?: number;
  requestingStock?: ProductStock;
  supplyingStock?: ProductStock;
}

// ✅ FIXED: Remove requestingCurrentStock
interface SelectedProduct extends Product {
  quantity: number;
  notes?: string;
}

interface Step2ProductSelectionProps {
  products: Product[];
  selectedProducts: SelectedProduct[];
  onChange: (selected: SelectedProduct[]) => void;
  onRefreshStock: () => Promise<void>;
  isRefreshing?: boolean;
}

export default function Step2ProductSelection({
  products,
  selectedProducts,
  onChange,
  onRefreshStock,
  isRefreshing = false,
}: Step2ProductSelectionProps) {
  const handleRemove = (productId: string) => {
    onChange(selectedProducts.filter(p => p.id !== productId));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">เลือกสินค้าที่ต้องการเบิก</h3>
        <p className="text-sm text-gray-500">
          เลือกสินค้าและระบุจำนวนที่ต้องการเบิก (คลิก รีเฟรช เพื่ออัพเดทจำนวนคงเหลือ)
        </p>
      </div>

      <ProductSelectionTable
        products={products}
        selectedProducts={selectedProducts}
        onSelectionChange={onChange}
        onRefreshStock={onRefreshStock}
        isRefreshing={isRefreshing}
      />

      <SelectedItemsSummary
        selectedProducts={selectedProducts}
        onRemove={handleRemove}
      />
    </div>
  );
}