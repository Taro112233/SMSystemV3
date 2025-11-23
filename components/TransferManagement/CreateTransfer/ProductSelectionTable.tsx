// components/TransferManagement/CreateTransfer/ProductSelectionTable.tsx
// ProductSelectionTable - Product table for selection

'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';

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

interface ProductSelectionTableProps {
  products: Product[];
  selectedProducts: SelectedProduct[];
  onSelectionChange: (selected: SelectedProduct[]) => void;
}

export default function ProductSelectionTable({
  products,
  selectedProducts,
  onSelectionChange,
}: ProductSelectionTableProps) {
  const [search, setSearch] = useState('');

  const filteredProducts = products.filter(
    (p) =>
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.genericName?.toLowerCase().includes(search.toLowerCase())
  );

  const isSelected = (productId: string) => {
    return selectedProducts.some((p) => p.id === productId);
  };

  const handleToggle = (product: Product) => {
    if (isSelected(product.id)) {
      onSelectionChange(selectedProducts.filter((p) => p.id !== product.id));
    } else {
      onSelectionChange([
        ...selectedProducts,
        { ...product, quantity: 1, notes: '' },
      ]);
    }
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    onSelectionChange(
      selectedProducts.map((p) =>
        p.id === productId ? { ...p, quantity: Math.max(1, quantity) } : p
      )
    );
  };

  const handleNotesChange = (productId: string, notes: string) => {
    onSelectionChange(
      selectedProducts.map((p) => (p.id === productId ? { ...p, notes } : p))
    );
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="ค้นหารหัส, ชื่อสินค้า..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <ScrollArea className="h-[400px] w-full rounded-md border">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="w-12 px-4 py-3 text-left">
                <span className="sr-only">Select</span>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                รหัส
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                ชื่อสินค้า
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                หน่วย
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-32">
                จำนวน
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                หมายเหตุ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.map((product) => {
              const selected = selectedProducts.find((p) => p.id === product.id);
              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={isSelected(product.id)}
                      onCheckedChange={() => handleToggle(product)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-blue-600">
                      {product.code}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <div className="text-sm text-gray-900">{product.name}</div>
                      {product.genericName && (
                        <div className="text-xs text-gray-500">
                          ({product.genericName})
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">{product.baseUnit}</span>
                  </td>
                  <td className="px-4 py-3">
                    {selected && (
                      <Input
                        type="number"
                        min="1"
                        value={selected.quantity}
                        onChange={(e) =>
                          handleQuantityChange(product.id, parseInt(e.target.value) || 1)
                        }
                        className="w-24"
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {selected && (
                      <Input
                        type="text"
                        placeholder="หมายเหตุ (ถ้ามี)"
                        value={selected.notes || ''}
                        onChange={(e) => handleNotesChange(product.id, e.target.value)}
                        className="w-48"
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}