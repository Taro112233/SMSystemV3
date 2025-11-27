// components/TransferManagement/TransferList/TransferTable.tsx
// UPDATED: Support organization view with department selection dialog

'use client';

import { useState } from 'react';
import { Transfer } from '@/types/transfer';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import TransferStatusBadge from '../shared/TransferStatusBadge';
import TransferPriorityBadge from '../shared/TransferPriorityBadge';
import TransferCodeDisplay from '../shared/TransferCodeDisplay';
import DepartmentBadge from '../shared/DepartmentBadge';
import DepartmentSelectionDialog from '../shared/DepartmentSelectionDialog';
import { ArrowRight } from 'lucide-react';

interface TransferTableProps {
  transfers: Transfer[];
  orgSlug: string;
  deptSlug?: string; // ✅ Optional for organization view
  viewType: 'outgoing' | 'incoming' | 'organization'; // ✅ Add organization type
  loading: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export default function TransferTable({
  transfers,
  orgSlug,
  deptSlug,
  viewType,
  loading,
}: TransferTableProps) {
  const router = useRouter();
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleRowClick = (transfer: Transfer) => {
    // ✅ Organization view - show department selection dialog
    if (viewType === 'organization') {
      setSelectedTransfer(transfer);
      setDialogOpen(true);
      return;
    }

    // ✅ Department view - navigate directly
    if (deptSlug) {
      const targetUrl = `/${orgSlug}/${deptSlug}/transfers/${transfer.id}`;
      router.push(targetUrl);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
        <p className="text-sm text-gray-500 mt-3">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mt-4">ไม่มีใบเบิก</h3>
        <p className="text-sm text-gray-500 mt-1">
          {viewType === 'organization'
            ? 'ยังไม่มีการสร้างใบเบิกสินค้า'
            : viewType === 'outgoing'
            ? 'ยังไม่มีหน่วยงานอื่นขอเบิกจากคุณ'
            : 'ยังไม่มีการสร้างใบเบิกสินค้า'}
        </p>
      </div>
    );
  }

  return (
    <>
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
                {viewType === 'organization'
                  ? 'หน่วยงาน'
                  : viewType === 'outgoing'
                  ? 'ขอเบิกไปที่'
                  : 'เบิกจาก'}
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
                  {transfer.requestReason && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {transfer.requestReason}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {viewType === 'organization' ? (
                    <div className="flex items-center gap-2">
                      <DepartmentBadge name={transfer.supplyingDepartment.name} />
                      <ArrowRight className="w-3 h-3 text-gray-400" />
                      <DepartmentBadge name={transfer.requestingDepartment.name} />
                    </div>
                  ) : (
                    <DepartmentBadge
                      name={
                        viewType === 'outgoing'
                          ? transfer.requestingDepartment.name
                          : transfer.supplyingDepartment.name
                      }
                    />
                  )}
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

      {/* ✅ Department Selection Dialog for organization view */}
      {selectedTransfer && (
        <DepartmentSelectionDialog
          transfer={selectedTransfer}
          orgSlug={orgSlug}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </>
  );
}