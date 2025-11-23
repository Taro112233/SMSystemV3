// components/TransferManagement/TransferDetail/TransferHistoryTable.tsx
// TransferHistoryTable - Status changes table

'use client';

import { TransferHistory } from '@/types/transfer';

interface TransferHistoryTableProps {
  history: TransferHistory[];
}

export default function TransferHistoryTable({ history }: TransferHistoryTableProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">ยังไม่มีประวัติการเปลี่ยนแปลง</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
              วันที่/เวลา
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
              การกระทำ
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
              เปลี่ยนแปลงโดย
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
              สถานะ
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
              หมายเหตุ
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {history.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-900">
                {formatDate(item.createdAt)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">{item.action}</td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {item.changedBySnapshot?.fullName || item.changedBy}
              </td>
              <td className="px-4 py-3 text-sm">
                {item.fromStatus && item.toStatus ? (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">{item.fromStatus}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-gray-900 font-medium">{item.toStatus}</span>
                  </div>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {item.notes || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}