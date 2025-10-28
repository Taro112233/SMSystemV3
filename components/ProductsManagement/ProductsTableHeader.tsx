// components/ProductsManagement/ProductsTableHeader.tsx
// ProductsTableHeader - Table header with sortable columns
// ✅ UPDATED: All columns sortable (including categories, stock, value)

'use client';

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { CategoryWithOptions } from '@/lib/category-helpers';

interface ProductsTableHeaderProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  categories: CategoryWithOptions[];
  onSort: (field: string) => void;
  canManage: boolean;
}

export default function ProductsTableHeader({
  sortBy,
  sortOrder,
  categories,
  onSort
}: ProductsTableHeaderProps) {
  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-1 text-blue-600" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1 text-blue-600" />
    );
  };

  const HeaderCell = ({ 
    field, 
    label, 
    sortable = true,
  }: { 
    field?: string; 
    label: string; 
    sortable?: boolean;
  }) => {
    return (
      <th
        className={`px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${
          sortable && field ? 'cursor-pointer hover:bg-gray-50 select-none' : ''
        }`}
        onClick={() => sortable && field && onSort(field)}
      >
        <div className="flex items-center">
          {label}
          {sortable && field && <SortIcon field={field} />}
        </div>
      </th>
    );
  };

  return (
    <thead className="bg-gray-50">
      <tr>
        <HeaderCell field="code" label="รหัสสินค้า" />
        <HeaderCell field="name" label="ชื่อสินค้า" />
        
        {/* ✅ Dynamic Category Columns - NOW SORTABLE */}
        {categories.map((category, index) => (
          <HeaderCell 
            key={category.id} 
            label={category.label}
            field={`category${index + 1}`} // ✅ category1, category2, category3
            sortable={true} // ✅ Enable sort
          />
        ))}
        
        {/* ✅ จำนวนคงเหลือ - NOW SORTABLE */}
        <HeaderCell 
          label="จำนวนคงเหลือ" 
          field="stock_quantity" // ✅ Custom sort field
          sortable={true} 
        />
        
        {/* ✅ มูลค่า - NOW SORTABLE */}
        <HeaderCell 
          label="มูลค่า" 
          field="stock_value" // ✅ Custom sort field
          sortable={true} 
        />
        
        {/* สถานะ */}
        <HeaderCell label="สถานะ" field="isActive" />
      </tr>
    </thead>
  );
}