// components/TransferManagement/TransferDetail/BatchDetailsRow.tsx
// BatchDetailsRow - UPDATED: Add notes section

'use client';

import { TransferItem } from '@/types/transfer';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, AlertCircle } from 'lucide-react';

interface BatchDetailsRowProps {
  item: TransferItem;
  batches: TransferItem['batches'];
}

export default function BatchDetailsRow({ item, batches }: BatchDetailsRowProps) {
  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const hasBatches = batches && batches.length > 0;
  const hasNotes = item.notes || (item.status === 'CANCELLED' && item.cancelReason);

  const sortedBatches = hasBatches ? [...batches].sort((a, b) => {
    if (!a.batch.expiryDate && !b.batch.expiryDate) return 0;
    if (!a.batch.expiryDate) return 1;
    if (!b.batch.expiryDate) return -1;
    return new Date(a.batch.expiryDate).getTime() - new Date(b.batch.expiryDate).getTime();
  }) : [];

  const showReceivedColumn = item.status === 'DELIVERED';

  return (
    <tr className="bg-blue-50">
      <td colSpan={8} className="px-4 py-3">
        <div className="ml-10 space-y-3">
          {hasBatches && (
            <div>
              <div className="text-xs font-semibold text-gray-700 uppercase mb-2">
                Batch Details (เรียงตามวันหมดอายุ - FIFO)
              </div>
              <div className="bg-white border border-blue-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-blue-50 border-b border-blue-200">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                        Lot Number
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                        วันหมดอายุ
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">
                        จัดเตรียม
                      </th>
                      {showReceivedColumn && (
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">
                          รับเข้า
                        </th>
                      )}
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">
                        สถานะ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedBatches.map((batch) => (
                      <tr key={batch.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm font-medium text-gray-900">
                          {batch.batch.lotNumber}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            {formatDate(batch.batch.expiryDate)}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="text-sm font-medium text-purple-900">
                            {batch.quantity.toLocaleString('th-TH')}
                          </div>
                          <div className="text-xs text-gray-500">{item.product.baseUnit}</div>
                        </td>
                        {showReceivedColumn && (
                          <td className="px-3 py-2 text-right">
                            <div className="text-sm font-medium text-green-900">
                              {(batch.receivedQuantity ?? batch.quantity).toLocaleString('th-TH')}
                            </div>
                            <div className="text-xs text-gray-500">{item.product.baseUnit}</div>
                          </td>
                        )}
                        <td className="px-3 py-2 text-center">
                          {item.status === 'DELIVERED' ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                              รับเข้าแล้ว
                            </Badge>
                          ) : item.status === 'PREPARED' ? (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                              จัดเตรียมแล้ว
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-600 text-xs">
                              รอดำเนินการ
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {showReceivedColumn && (
                    <tfoot className="bg-blue-50 border-t border-blue-200">
                      <tr>
                        <td colSpan={2} className="px-3 py-2 text-sm font-semibold text-gray-700">
                          รวม
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="text-sm font-semibold text-purple-900">
                            {sortedBatches.reduce((sum, b) => sum + b.quantity, 0).toLocaleString('th-TH')}
                          </div>
                          <div className="text-xs text-gray-500">{item.product.baseUnit}</div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="text-sm font-semibold text-green-900">
                            {sortedBatches.reduce((sum, b) => sum + (b.receivedQuantity ?? b.quantity), 0).toLocaleString('th-TH')}
                          </div>
                          <div className="text-xs text-gray-500">{item.product.baseUnit}</div>
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}

          {hasNotes && (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase mb-2">
                <FileText className="h-3.5 w-3.5" />
                {item.status === 'CANCELLED' && item.cancelReason ? 'เหตุผลยกเลิก' : 'หมายเหตุ'}
              </div>
              <div className={`p-3 rounded-lg border ${
                item.status === 'CANCELLED' && item.cancelReason
                  ? 'bg-red-50 border-red-200'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start gap-2">
                  {item.status === 'CANCELLED' && item.cancelReason && (
                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className={`text-sm ${
                    item.status === 'CANCELLED' && item.cancelReason
                      ? 'text-red-900'
                      : 'text-blue-900'
                  }`}>
                    {item.status === 'CANCELLED' && item.cancelReason 
                      ? item.cancelReason 
                      : item.notes}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}