// components/ProductsManagement/ProductsHeader.tsx
// ProductsHeader - Minimal header

'use client';

import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProductsHeaderProps {
  onCreateClick: () => void;
  onSearchChange: (search: string) => void;
  canManage: boolean;
  searchValue: string;
}

export default function ProductsHeader({
  onCreateClick,
  onSearchChange,
  canManage,
  searchValue,
}: ProductsHeaderProps) {
  const [localSearch, setLocalSearch] = useState(searchValue);

  useEffect(() => {
    if (localSearch === searchValue) return;
    const timer = setTimeout(() => onSearchChange(localSearch), 500);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, searchValue]);

  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900">จัดการสินค้า</h1>

      <div className="flex items-center gap-3">
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

        {canManage && (
          <Button onClick={onCreateClick} className="gap-2">
            <Plus className="h-4 w-4" />
            เพิ่มสินค้า
          </Button>
        )}
      </div>
    </div>
  );
}