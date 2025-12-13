// components/DepartmentStocksManagement/StocksFilters.tsx
// StocksFilters - Filter panel for stocks

'use client';

import { StockFilters } from '@/types/stock';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Filter, X } from 'lucide-react';

interface StocksFiltersProps {
  filters: StockFilters;
  onFilterChange: (filters: Partial<StockFilters>) => void;
}

export default function StocksFilters({
  filters,
  onFilterChange,
}: StocksFiltersProps) {
  const hasActiveFilters = filters.showLowStock || filters.showExpiring;

  const handleReset = () => {
    onFilterChange({
      showLowStock: false,
      showExpiring: false,
    });
  };

  return (
    <div className="flex items-center gap-4 pb-4 border-b border-gray-200 flex-wrap">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Filter className="h-4 w-4" />
        <span>กรองข้อมูล:</span>
      </div>

      {/* Low Stock Filter */}
      <div className="flex items-center space-x-2">
        <Switch
          id="low-stock"
          checked={filters.showLowStock || false}
          onCheckedChange={(checked) => onFilterChange({ showLowStock: checked })}
        />
        <Label htmlFor="low-stock" className="text-sm cursor-pointer">
          สต็อกต่ำ
        </Label>
      </div>

      {/* Expiring Soon Filter */}
      <div className="flex items-center space-x-2">
        <Switch
          id="expiring"
          checked={filters.showExpiring || false}
          onCheckedChange={(checked) => onFilterChange({ showExpiring: checked })}
        />
        <Label htmlFor="expiring" className="text-sm cursor-pointer">
          ใกล้หมดอายุ
        </Label>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="gap-1 text-gray-600"
        >
          <X className="h-4 w-4 text-red-500" />
          <p className='text-red-500'>ล้างตัวกรอง</p>
        </Button>
      )}
    </div>
  );
}