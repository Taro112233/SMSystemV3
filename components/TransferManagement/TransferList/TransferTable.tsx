// components/TransferManagement/TransferList/TransferTable.tsx
// TransferTable - Reusable table component

'use client';

import { Transfer } from '@/types/transfer';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import TransferStatusBadge from '../shared/TransferStatusBadge';
import TransferPriorityBadge from '../shared/TransferPriorityBadge';
import TransferCodeDisplay from '../shared/TransferCodeDisplay';
import DepartmentBadge from '../shared/DepartmentBadge';
import { ArrowRight, Package } from 'lucide-react';

interface TransferTableProps {
  transfers: Transfer[];
  orgSlug: string;
  viewType: 'organization' | 'department';
}

export default function TransferTable({
  transfers,
  orgSlug,
  viewType,
}: TransferTableProps) {
  const router = useRouter();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleRowClick = (transfer: Transfer) => {
    // Navigate to detail page based on view type
    if (viewType === 'organization') {
      router.push(`/${orgSlug}/transfers/${transfer.id}`);
    } else {
      // From department view
      const deptSlug = transfer.requestingDepartment.slug || transfer.supplyingDepartment.slug;
      router.push(`/${orgSlug}/${deptSlug}/transfers/${transfer.id}`);
    }
  };

  if (transfers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mt-4">ไม่มีใบเบิก</h3>
        <p className="text-sm text-gray-500 mt-1">ยังไม่มีการสร้างใบเบิกสินค้า</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b-2 border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
              เลขที่ใบเบิก
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
              หัวข้อ
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
              หน่วยงาน
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
              รายการ
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
              สถานะ
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
              ความสำคัญ
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
              วันที่สร้าง
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {transfers.map((transfer) => (
            <tr
              key={transfer.id}
              onClick={() => handleRowClick(transfer)}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3">
                <TransferCodeDisplay code={transfer.code} />
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">{transfer.title}</div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <DepartmentBadge name={transfer.supplyingDepartment.name} />
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                  <DepartmentBadge name={transfer.requestingDepartment.name} />
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <Badge variant="outline" className="bg-gray-50">
                  {transfer.totalItems} รายการ
                </Badge>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex justify-center">
                  <TransferStatusBadge status={transfer.status} />
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex justify-center">
                  <TransferPriorityBadge priority={transfer.priority} />
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {formatDate(transfer.requestedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}