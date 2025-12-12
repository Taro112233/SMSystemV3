// components/ProductsManagement2/ProductsFilters.tsx
// ProductsFilters - Minimal filter panel

'use client';

import { ProductFilters } from '@/lib/product-helpers';
import { CategoryWithOptions } from '@/lib/category-helpers';
import { CategoryFiltersState } from '@/types/product';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

interface ProductsFiltersProps {
  filters: ProductFilters;
  categoryFilters: CategoryFiltersState;
  categories: CategoryWithOptions[];
  onFilterChange: (filters: Partial<ProductFilters>) => void;
  onCategoryFilterChange: (filters: CategoryFiltersState) => void;
}

export default function ProductsFilters({
  filters,
  categoryFilters,
  categories,
  onFilterChange,
  onCategoryFilterChange,
}: ProductsFiltersProps) {
  const hasActiveFilters =
    filters.isActive !== true ||
    categoryFilters.category1 ||
    categoryFilters.category2 ||
    categoryFilters.category3;

  const handleReset = () => {
    onFilterChange({ isActive: true });
    onCategoryFilterChange({});
  };

  const handleCategoryChange = (index: number, value: string) => {
    const key = `category${index}` as keyof CategoryFiltersState;
    onCategoryFilterChange({
      ...categoryFilters,
      [key]: value === 'all' ? undefined : value,
    });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select
        value={filters.isActive === null ? 'all' : filters.isActive ? 'active' : 'inactive'}
        onValueChange={(value) => {
          const isActive = value === 'all' ? null : value === 'active';
          onFilterChange({ isActive });
        }}
      >
        <SelectTrigger className="w-28 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">ทั้งหมด</SelectItem>
          <SelectItem value="active">ใช้งาน</SelectItem>
          <SelectItem value="inactive">ปิด</SelectItem>
        </SelectContent>
      </Select>

      {categories.map((cat, idx) => (
        <Select
          key={cat.id}
          value={categoryFilters[`category${idx + 1}` as keyof CategoryFiltersState] || 'all'}
          onValueChange={(value) => handleCategoryChange(idx + 1, value)}
        >
          <SelectTrigger className="w-32 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            {cat.options.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.label || opt.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 gap-1">
          <X className="h-3 w-3" />
          ล้าง
        </Button>
      )}
    </div>
  );
}