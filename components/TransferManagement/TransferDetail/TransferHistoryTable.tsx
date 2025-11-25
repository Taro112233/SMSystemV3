// components/TransferManagement/TransferDetail/TransferHistoryTable.tsx
// TransferHistoryTable - Status changes table with product details - FIXED

'use client';

import { TransferHistory, TransferItem } from '@/types/transfer';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';

interface TransferHistoryTableProps {
  history: TransferHistory[];
  items?: TransferItem[]; // ✅ เพิ่ม optional
}

export default function TransferHistoryTable({ history, items = [] }: TransferHistoryTableProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ✅ Helper: หา item จาก itemId (with null safety)
  const getItemInfo = (itemId?: string) => {
    if (!itemId || !items || items.length === 0) return null;
    return items.find(item => item.id === itemId);
  };

  // ✅ Helper: แปลง action ให้อ่านง่าย
  const getActionLabel = (action: string) => {
    const actionMap: Record<string, string> = {
      'CREATED': '✨ สร้างใบเบิก',
      'APPROVED': '✅ อนุมัติ',
      'PREPARED': '📦 จัดเตรียม',
      'DELIVERED': '🚚 รับเข้า',
      'CANCELLED': '❌ ยกเลิก',
    };
    return actionMap[action] || action;
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
        <thead className="bg-gray-50 border-b-2 border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
              วันที่/เวลา
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
              การกระทำ
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-80">
              รายละเอียด
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
              ผู้ดำเนินการ
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
          {history.map((record) => {
            const item = getItemInfo(record.itemId);
            const isItemLevel = !!record.itemId; // ✅ แยก item-level vs transfer-level

            return (
              <tr key={record.id} className="hover:bg-gray-50">
                {/* วันที่/เวลา */}
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                  {formatDate(record.createdAt)}
                </td>

                {/* การกระทำ */}
                <td className="px-4 py-3 text-sm">
                  <span className="font-medium text-gray-900">
                    {getActionLabel(record.action)}
                  </span>
                </td>

                {/* รายละเอียด - แสดงข้อมูลสินค้าถ้ามี */}
                <td className="px-4 py-3 text-sm">
                  {isItemLevel && item ? (
                    <div className="flex items-start gap-2">
                      <Package className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {item.product.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-xs">
                            {item.product.code}
                          </Badge>
                          {item.product.genericName && (
                            <span className="text-xs text-gray-500 truncate">
                              {item.product.genericName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : isItemLevel ? (
                    <div className="text-gray-500 italic text-xs">
                      ไม่พบข้อมูลสินค้า
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">
                      การกระทำระดับใบเบิก
                    </div>
                  )}
                </td>

                {/* ผู้ดำเนินการ */}
                <td className="px-4 py-3 text-sm text-gray-900">
                  <div className="font-medium">
                    {record.changedBySnapshot?.fullName || record.changedBy}
                  </div>
                  {record.changedBySnapshot?.role && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {record.changedBySnapshot.role}
                    </div>
                  )}
                </td>

                {/* สถานะ */}
                <td className="px-4 py-3 text-sm">
                  {record.fromStatus && record.toStatus ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs bg-gray-100">
                        {record.fromStatus}
                      </Badge>
                      <span className="text-gray-400">→</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          record.toStatus === 'DELIVERED' ? 'bg-green-100 text-green-800 border-green-200' :
                          record.toStatus === 'CANCELLED' ? 'bg-red-100 text-red-800 border-red-200' :
                          record.toStatus === 'PREPARED' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                          record.toStatus === 'APPROVED' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          'bg-yellow-100 text-yellow-800 border-yellow-200'
                        }`}
                      >
                        {record.toStatus}
                      </Badge>
                    </div>
                  ) : record.toStatus ? (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        record.toStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }`}
                    >
                      {record.toStatus}
                    </Badge>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>

                {/* หมายเหตุ */}
                <td className="px-4 py-3 text-sm text-gray-600">
                  {record.notes || '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}