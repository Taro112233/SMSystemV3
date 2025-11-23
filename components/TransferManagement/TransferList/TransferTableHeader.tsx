// components/TransferManagement/TransferList/TransferTableHeader.tsx
// TransferTableHeader - Table columns

'use client';

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface TransferTableHeaderProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  viewType: 'outgoing' | 'incoming' | 'organization';
}

export default function TransferTableHeader({
  sortBy,
  sortOrder,
  onSort,
  viewType,
}: TransferTableHeaderProps) {
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
        <HeaderCell field="code" label="รหัสใบเบิก" />
        <HeaderCell field="title" label="หัวข้อ" />
        <HeaderCell
          label={
            viewType === 'outgoing'
              ? 'ไปยัง'
              : viewType === 'incoming'
              ? 'จาก'
              : 'จาก → ถึง'
          }
          sortable={false}
        />
        <HeaderCell label="สถานะ" field="status" />
        <HeaderCell label="ความสำคัญ" field="priority" />
        <HeaderCell label="จำนวนรายการ" sortable={false} />
        <HeaderCell field="requestedAt" label="วันที่สร้าง" />
      </tr>
    </thead>
  );
}