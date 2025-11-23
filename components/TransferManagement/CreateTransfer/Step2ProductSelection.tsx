// components/TransferManagement/CreateTransfer/Step2ProductSelection.tsx
// Step2ProductSelection - Product selection step

'use client';

import ProductSelectionTable from './ProductSelectionTable';
import SelectedItemsSummary from './SelectedItemsSummary';

interface Product {
  id: string;
  code: string;
  name: string;
  genericName?: string;
  baseUnit: string;
}

interface SelectedProduct extends Product {
  quantity: number;
  notes?: string;
}

interface Step2ProductSelectionProps {
  products: Product[];
  selectedProducts: SelectedProduct[];
  onChange: (selected: SelectedProduct[]) => void;
}

export default function Step2ProductSelection({
  products,
  selectedProducts,
  onChange,
}: Step2ProductSelectionProps) {
  const handleRemove = (productId: string) => {
    onChange(selectedProducts.filter((p) => p.id !== productId));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">เลือกสินค้าที่ต้องการเบิก</h3>
        <p className="text-sm text-gray-500">
          เลือกสินค้าและระบุจำนวนที่ต้องการเบิก
        </p>
      </div>

      <ProductSelectionTable
        products={products}
        selectedProducts={selectedProducts}
        onSelectionChange={onChange}
      />

      <SelectedItemsSummary
        selectedProducts={selectedProducts}
        onRemove={handleRemove}
      />
    </div>
  );
}