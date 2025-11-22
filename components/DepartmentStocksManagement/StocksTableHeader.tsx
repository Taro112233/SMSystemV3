// components/DepartmentStocksManagement/StocksTableHeader.tsx
// StocksTableHeader - UPDATED: Change from "ราคาเฉลี่ย" to "มูลค่ารวม"

'use client';

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface StocksTableHeaderProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export default function StocksTableHeader({
  sortBy,
  sortOrder,
  onSort,
}: StocksTableHeaderProps) {
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
        <HeaderCell field="productCode" label="รหัสสินค้า" />
        <HeaderCell field="productName" label="ชื่อสินค้า" />
        <HeaderCell label="ตำแหน่ง" sortable={false} />
        <HeaderCell field="quantity" label="คงเหลือ" />
        <HeaderCell label="จอง" sortable={false} />
        <HeaderCell label="รอรับ" sortable={false} />
        <HeaderCell field="expiryDate" label="Lot/Exp ใกล้สุด" />
        <HeaderCell label="มูลค่ารวม" sortable={false} />
        <HeaderCell label="อัพเดท" sortable={false} />
      </tr>
    </thead>
  );
}