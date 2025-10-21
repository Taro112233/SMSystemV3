// components/ProductsManagement/ProductsTableHeader.tsx
// ProductsTableHeader - Sortable table header with category columns

'use client';

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { SortableProductField, SortOrder } from '@/lib/product-helpers';
import { CategoryWithOptions } from '@/lib/category-helpers';

interface ProductsTableHeaderProps {
  sortBy: SortableProductField;
  sortOrder: SortOrder;
  categories: CategoryWithOptions[];
  onSort: (field: string) => void;
  canManage: boolean;
}

export default function ProductsTableHeader({
  sortBy,
  sortOrder,
  categories,
  onSort,
  canManage,
}: ProductsTableHeaderProps) {
  const getSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 text-blue-600" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-blue-600" />
    );
  };

  return (
    <thead className="bg-gray-50">
      <tr>
        {/* รหัสสินค้า - Sortable */}
        <th
          className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
          onClick={() => onSort('code')}
        >
          <div className="flex items-center gap-2">
            <span>รหัสสินค้า</span>
            {getSortIcon('code')}
          </div>
        </th>

        {/* ชื่อสินค้า - Sortable */}
        <th
          className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
          onClick={() => onSort('name')}
        >
          <div className="flex items-center gap-2">
            <span>ชื่อสินค้า</span>
            {getSortIcon('name')}
          </div>
        </th>

        {/* Category Columns - Sortable (ใช้ category key เป็น sort field) */}
        {categories.map((category) => (
          <th
            key={category.id}
            className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
            onClick={() => onSort(`category_${category.id}`)}
          >
            <div className="flex items-center gap-2">
              <span>{category.label}</span>
              {getSortIcon(`category_${category.id}`)}
            </div>
          </th>
        ))}

        {/* จำนวนคงเหลือ - Sortable (Mock) */}
        <th
          className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
          onClick={() => onSort('stockQuantity')}
        >
          <div className="flex items-center gap-2">
            <span>จำนวนคงเหลือ</span>
            {getSortIcon('stockQuantity')}
          </div>
        </th>

        {/* หน่วยนับ - Sortable */}
        <th
          className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
          onClick={() => onSort('baseUnit')}
        >
          <div className="flex items-center gap-2">
            <span>หน่วยนับ</span>
            {getSortIcon('baseUnit')}
          </div>
        </th>

        {/* สถานะ - Sortable */}
        <th
          className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
          onClick={() => onSort('isActive')}
        >
          <div className="flex items-center gap-2">
            <span>สถานะ</span>
            {getSortIcon('isActive')}
          </div>
        </th>

        {/* จัดการ - Not sortable */}
        {canManage && (
          <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
            จัดการ
          </th>
        )}
      </tr>
    </thead>
  );
}