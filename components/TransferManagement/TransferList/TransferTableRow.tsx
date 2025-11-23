// components/TransferManagement/TransferList/TransferTableRow.tsx
'use client';

import { Transfer } from '@/types/transfer';
import { useRouter } from 'next/navigation';
import TransferStatusBadge from '../shared/TransferStatusBadge';
import TransferPriorityBadge from '../shared/TransferPriorityBadge';
import TransferCodeDisplay from '../shared/TransferCodeDisplay';
import DepartmentBadge from '../shared/DepartmentBadge';
import { ArrowRight } from 'lucide-react';

interface TransferTableRowProps {
  transfer: Transfer;
  orgSlug: string;
  deptSlug?: string;
  viewType: 'outgoing' | 'incoming' | 'organization';
}

export default function TransferTableRow({
  transfer,
  orgSlug,
  deptSlug,
  viewType,
}: TransferTableRowProps) {
  const router = useRouter();

  const handleRowClick = () => {
    if (deptSlug) {
      router.push(`/${orgSlug}/${deptSlug}/transfers/${transfer.id}`);
    } else {
      // From organization view, determine department based on viewType
      const targetDeptSlug =
        viewType === 'outgoing'
          ? transfer.supplyingDepartment.slug
          : transfer.requestingDepartment.slug;
      router.push(`/${orgSlug}/${targetDeptSlug}/transfers/${transfer.id}`);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <tr
      className="hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={handleRowClick}
    >
      <td className="px-4 py-3">
        <TransferCodeDisplay code={transfer.code} />
      </td>

      <td className="px-4 py-3">
        <div className="space-y-0.5">
          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
            {transfer.title}
          </div>
          {transfer.requestReason && (
            <div className="text-xs text-gray-500 max-w-xs truncate">
              {transfer.requestReason}
            </div>
          )}
        </div>
      </td>

      <td className="px-4 py-3">
        {viewType === 'organization' ? (
          <div className="flex items-center gap-2">
            <DepartmentBadge name={transfer.supplyingDepartment.name} />
            <ArrowRight className="w-3 h-3 text-gray-400" />
            <DepartmentBadge name={transfer.requestingDepartment.name} />
          </div>
        ) : viewType === 'outgoing' ? (
          <DepartmentBadge name={transfer.requestingDepartment.name} />
        ) : (
          <DepartmentBadge name={transfer.supplyingDepartment.name} />
        )}
      </td>

      <td className="px-4 py-3">
        <TransferStatusBadge status={transfer.status} />
      </td>

      <td className="px-4 py-3">
        <TransferPriorityBadge priority={transfer.priority} />
      </td>

      <td className="px-4 py-3">
        <span className="text-sm text-gray-900">{transfer.totalItems} รายการ</span>
      </td>

      <td className="px-4 py-3">
        <span className="text-sm text-gray-600">{formatDate(transfer.requestedAt)}</span>
      </td>
    </tr>
  );
}