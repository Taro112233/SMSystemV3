// components/ProductsManagement/ProductsFilters.tsx
// ProductsFilters - Filter panel with category filters and batch save functionality

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
import { Filter, X, Save } from 'lucide-react';

interface ProductsFiltersProps {
  filters: ProductFilters;
  categoryFilters: CategoryFiltersState;
  categories: CategoryWithOptions[];
  onFilterChange: (filters: Partial<ProductFilters>) => void;
  onCategoryFilterChange: (filters: CategoryFiltersState) => void;
  onSaveStatusChanges?: () => void;
  hasPendingChanges?: boolean;
}

export default function ProductsFilters({
  filters,
  categoryFilters,
  categories,
  onFilterChange,
  onCategoryFilterChange,
  onSaveStatusChanges,
  hasPendingChanges = false,
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

  const handleCategoryChange = (categoryIndex: number, value: string) => {
    const key = `category${categoryIndex}` as keyof CategoryFiltersState;
    onCategoryFilterChange({
      ...categoryFilters,
      [key]: value === 'all' ? undefined : value,
    });
  };

  return (
    <div className="flex items-center gap-3 pb-4 border-b border-gray-200 flex-wrap">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Filter className="h-4 w-4" />
        <span>กรองข้อมูล:</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">สถานะ:</span>
        <Select
          value={filters.isActive === null ? 'all' : filters.isActive ? 'active' : 'inactive'}
          onValueChange={(value) => {
            const isActive =
              value === 'all' ? null : value === 'active' ? true : false;
            onFilterChange({ isActive });
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-50">
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="active">ใช้งาน</SelectItem>
            <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {categories[0] && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{categories[0].label}:</span>
          <Select
            value={categoryFilters.category1 || 'all'}
            onValueChange={(value) => handleCategoryChange(1, value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="all">ทั้งหมด</SelectItem>
              {categories[0].options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label || option.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {categories[1] && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{categories[1].label}:</span>
          <Select
            value={categoryFilters.category2 || 'all'}
            onValueChange={(value) => handleCategoryChange(2, value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="all">ทั้งหมด</SelectItem>
              {categories[1].options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label || option.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {categories[2] && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{categories[2].label}:</span>
          <Select
            value={categoryFilters.category3 || 'all'}
            onValueChange={(value) => handleCategoryChange(3, value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="all">ทั้งหมด</SelectItem>
              {categories[2].options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label || option.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="gap-1 text-gray-600"
        >
          <X className="h-4 w-4" />
          ล้างตัวกรอง
        </Button>
      )}

      {hasPendingChanges && onSaveStatusChanges && (
        <div className="ml-auto flex items-center gap-2">
          <Button
            onClick={onSaveStatusChanges}
            size="sm"
            className="gap-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <Save className="h-4 w-4" />
            บันทึก
          </Button>
        </div>
      )}
    </div>
  );
}