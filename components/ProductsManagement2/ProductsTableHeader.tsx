// components/ProductsManagement2/ProductsTableHeader.tsx
// ProductsTableHeader - Minimal sortable header

'use client';

import { ArrowUpDown } from 'lucide-react';
import { CategoryWithOptions } from '@/lib/category-helpers';

interface ProductsTableHeaderProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  categories: CategoryWithOptions[];
  onSort: (field: string) => void;
}

export default function ProductsTableHeader({
  sortBy,
  sortOrder,
  categories,
  onSort,
}: ProductsTableHeaderProps) {
  const HeaderCell = ({ field, label }: { field?: string; label: string }) => (
    <th
      className={`px-3 py-2 text-left text-xs font-medium text-gray-600 ${
        field ? 'cursor-pointer hover:bg-gray-50' : ''
      }`}
      onClick={() => field && onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {field && <ArrowUpDown className="h-3 w-3 text-gray-400" />}
      </div>
    </th>
  );

  return (
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        <HeaderCell field="code" label="รหัส" />
        <HeaderCell field="name" label="ชื่อสินค้า" />
        <HeaderCell label="ชื่อสามัญ" />
        <HeaderCell label="หน่วย" />
        {categories.map((cat) => (
          <HeaderCell key={cat.id} label={cat.label} />
        ))}
        <HeaderCell label="คงเหลือ" />
        <HeaderCell label="มูลค่า" />
        <HeaderCell label="สถานะ" />
        <HeaderCell label="" />
      </tr>
    </thead>
  );
}