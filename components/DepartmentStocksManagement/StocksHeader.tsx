// components/DepartmentStocksManagement/StocksHeader.tsx
// UPDATED: Add "เพิ่มสินค้าเข้าสต็อก" button

'use client';

import { useState, useEffect } from 'react';
import { Search, Package, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface StocksHeaderProps {
  departmentName: string;
  onSearchChange: (search: string) => void;
  onAddStock: () => void;
  searchValue: string;
  canManage: boolean;
}

export default function StocksHeader({
  departmentName,
  onSearchChange,
  onAddStock,
  searchValue,
  canManage,
}: StocksHeaderProps) {
  const [localSearch, setLocalSearch] = useState(searchValue);

  // Debounce search input
  useEffect(() => {
    if (localSearch === searchValue) return;

    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, searchValue]);

  // Sync with parent if searchValue changes externally
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Package className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">สต็อกสินค้า</h1>
          <p className="text-sm text-gray-500 mt-1">{departmentName}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="ค้นหารหัส, ชื่อสินค้า..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Add Stock Button */}
        {canManage && (
          <Button onClick={onAddStock} className="gap-2">
            <Plus className="h-4 w-4" />
            เพิ่มสินค้าเข้าสต็อก
          </Button>
        )}
      </div>
    </div>
  );
}