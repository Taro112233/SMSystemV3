// components/ProductsManagement/ProductsTableHeader.tsx
// ProductsTableHeader - Table header with sortable columns

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
  onSort,
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
    width,
  }: {
    field?: string;
    label: string;
    sortable?: boolean;
    width?: string;
  }) => {
    return (
      <th
        className={`px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${width || ''} ${
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
        <HeaderCell field="code" label="รหัสสินค้า" width="w-32" />
        <HeaderCell field="name" label="ชื่อสินค้า" width="w-64" />
        <HeaderCell label="ชื่อสามัญ" sortable={false} width="w-48" />
        <HeaderCell label="หน่วย" sortable={false} width="w-24" />
        
        {categories.map((category, index) => (
          <HeaderCell
            key={category.id}
            label={category.label}
            field={`category${index + 1}`}
            width="w-40"
          />
        ))}
        
        <HeaderCell label="คงเหลือ" sortable={false} width="w-32" />
        <HeaderCell label="มูลค่า" sortable={false} width="w-32" />
        <HeaderCell label="สถานะ" field="isActive" width="w-28" />
      </tr>
    </thead>
  );
}