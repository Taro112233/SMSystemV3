// components/ProductsManagement/ProductsHeader.tsx
// ProductsHeader - Header with search and create button

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">จัดการสินค้า</h1>
        <p className="text-sm text-gray-500 mt-1">
          จัดการข้อมูลสินค้าและยาในองค์กร
        </p>
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

        {/* Create Button */}
        <Button 
          onClick={onCreateClick} 
          className="gap-2"
          disabled={!canManage}
        >
          <Plus className="h-4 w-4" />
          เพิ่มรายการสินค้า
        </Button>
      </div>
    </div>
  );
}