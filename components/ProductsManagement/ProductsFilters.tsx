// components/ProductsManagement/ProductsFilters.tsx
// ProductsFilters - Minimal filter panel with dynamic placeholder

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

  const getCategoryDisplayValue = (categoryId: string, categoryLabel: string): string => {
    if (!categoryId) return categoryLabel;
    
    const category = categories.find(c => c.id === categoryFilters[`category${categories.indexOf(categories.find(cat => cat.id === categoryId)!) + 1}` as keyof CategoryFiltersState]);
    if (!category) return categoryLabel;
    
    const selectedValue = categoryFilters[`category${categories.indexOf(category) + 1}` as keyof CategoryFiltersState];
    if (!selectedValue) return categoryLabel;
    
    const option = category.options.find(opt => opt.id === selectedValue);
    return option ? (option.label || option.value) : categoryLabel;
  };

  return (
    <div className="flex items-center gap-2 flex-wrap pb-4 border-b border-gray-200">
      {/* Status Filter */}
      <Select
        value={filters.isActive === null ? 'all' : filters.isActive ? 'active' : 'inactive'}
        onValueChange={(value) => {
          const isActive = value === 'all' ? null : value === 'active';
          onFilterChange({ isActive });
        }}
      >
        <SelectTrigger className="w-28 h-8">
          <SelectValue placeholder="สถานะ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">สถานะ</SelectItem>
          <SelectItem value="active">ใช้งาน</SelectItem>
          <SelectItem value="inactive">ปิด</SelectItem>
        </SelectContent>
      </Select>

      {/* Category Filters */}
      {categories.map((cat, idx) => {
        const categoryKey = `category${idx + 1}` as keyof CategoryFiltersState;
        const selectedValue = categoryFilters[categoryKey] || 'all';
        const displayValue = selectedValue === 'all' 
          ? cat.label 
          : cat.options.find(opt => opt.id === selectedValue)?.label || 
            cat.options.find(opt => opt.id === selectedValue)?.value || 
            cat.label;

        return (
          <Select
            key={cat.id}
            value={selectedValue}
            onValueChange={(value) => handleCategoryChange(idx + 1, value)}
          >
            <SelectTrigger className="w-32 h-8">
              <SelectValue>
                {displayValue}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{cat.label}</SelectItem>
              {cat.options.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.label || opt.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      })}

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 gap-1">
          <X className="h-4 w-4 text-red-500" />
          <p className='text-red-500'>ล้างตัวกรอง</p>
        </Button>
      )}
    </div>
  );
}