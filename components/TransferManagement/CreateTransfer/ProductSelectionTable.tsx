// components/TransferManagement/CreateTransfer/ProductSelectionTable.tsx
// ProductSelectionTable - UPDATED: Sort products alphabetically by code

'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

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

interface SelectedProduct extends Product {
  quantity: number;
  notes?: string;
}

interface ProductSelectionTableProps {
  products: Product[];
  selectedProducts: SelectedProduct[];
  onSelectionChange: (selected: SelectedProduct[]) => void;
  onRefreshStock: () => Promise<void>;
  isRefreshing?: boolean;
}

export default function ProductSelectionTable({
  products,
  selectedProducts,
  onSelectionChange,
  onRefreshStock,
  isRefreshing = false,
}: ProductSelectionTableProps) {
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'requesting' | 'supplying'>('all');

  // ✅ Filter + Sort products alphabetically by code
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Apply tab filter
    if (filterTab === 'requesting') {
      filtered = filtered.filter(p => p.requestingStock !== undefined);
    } else if (filterTab === 'supplying') {
      filtered = filtered.filter(p => p.supplyingStock !== undefined);
    }

    // Apply search filter
    if (search) {
      filtered = filtered.filter(p =>
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.genericName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // ✅ Sort alphabetically by product code
    return filtered.sort((a, b) => a.code.localeCompare(b.code, 'th'));
  }, [products, filterTab, search]);

  const isSelected = (productId: string) => {
    return selectedProducts.some(p => p.id === productId);
  };

  const handleToggle = (product: Product) => {
    if (isSelected(product.id)) {
      onSelectionChange(selectedProducts.filter(p => p.id !== product.id));
    } else {
      onSelectionChange([
        ...selectedProducts,
        {
          ...product,
          quantity: product.defaultWithdrawalQty || 1,
          notes: '',
        },
      ]);
    }
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    onSelectionChange(
      selectedProducts.map(p =>
        p.id === productId ? { ...p, quantity: Math.max(1, quantity) } : p
      )
    );
  };

  const handleNotesChange = (productId: string, notes: string) => {
    onSelectionChange(
      selectedProducts.map(p => (p.id === productId ? { ...p, notes } : p))
    );
  };

  const formatTimeAgo = (date: Date | undefined) => {
    if (!date) return '-';
    try {
      return formatDistanceToNow(new Date(date), { 
        addSuffix: true, 
        locale: th 
      });
    } catch {
      return '-';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="ค้นหารหัส, ชื่อสินค้า..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs value={filterTab} onValueChange={(v) => setFilterTab(v as 'all' | 'requesting' | 'supplying')}>
          <TabsList>
            <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
            <TabsTrigger value="requesting">แผนกตัวเอง</TabsTrigger>
            <TabsTrigger value="supplying">แผนกที่เบิก</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefreshStock}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          รีเฟรช
        </Button>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        แสดง {filteredProducts.length} รายการ (เรียงตาม A-Z)
      </div>

      {/* Table */}
      <ScrollArea className="h-[500px] w-full rounded-md border">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
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
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase w-32">
                คงเหลือ<br />แผนกที่เบิก
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase w-32">
                คงเหลือ<br />แผนกตัวเอง
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-32">
                จำนวนเบิก
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                หมายเหตุ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.map((product) => {
              const selected = selectedProducts.find(p => p.id === product.id);
              const requestingStock = product.requestingStock;
              const supplyingStock = product.supplyingStock;

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

                  {/* Supplying Dept Stock */}
                  <td className="px-4 py-3">
                    {supplyingStock ? (
                      <div className="text-center space-y-1">
                        <div className={`text-sm font-medium ${
                          supplyingStock.availableQuantity > 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {supplyingStock.availableQuantity.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTimeAgo(supplyingStock.lastUpdated)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="text-sm text-gray-400">-</span>
                      </div>
                    )}
                  </td>

                  {/* Requesting Dept Stock */}
                  <td className="px-4 py-3">
                    {requestingStock ? (
                      <div className="text-center space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {requestingStock.availableQuantity.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTimeAgo(requestingStock.lastUpdated)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="text-sm text-gray-400">-</span>
                      </div>
                    )}
                  </td>

                  {/* Quantity Input */}
                  <td className="px-4 py-3">
                    {selected && (
                      <Input
                        type="number"
                        min="1"
                        value={selected.quantity}
                        onChange={(e) =>
                          handleQuantityChange(product.id, parseInt(e.target.value) || 1)
                        }
                        className="w-24 h-8 text-sm"
                        placeholder={product.defaultWithdrawalQty?.toString()}
                      />
                    )}
                  </td>

                  {/* Notes */}
                  <td className="px-4 py-3">
                    {selected && (
                      <Input
                        type="text"
                        placeholder="หมายเหตุ (ถ้ามี)"
                        value={selected.notes || ''}
                        onChange={(e) => handleNotesChange(product.id, e.target.value)}
                        className="w-48 h-8 text-sm"
                      />
                    )}
                  </td>
                </tr>
              );
            })}

            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  ไม่พบสินค้า
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}