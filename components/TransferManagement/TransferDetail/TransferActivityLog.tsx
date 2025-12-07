// components/TransferManagement/TransferDetail/TransferActivityLog.tsx
// TransferActivityLog - Timeline-style activity feed

'use client';

import { TransferHistory, TransferItem } from '@/types/transfer';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  XCircle, 
  ClipboardList,
  User,
  Clock
} from 'lucide-react';

interface TransferActivityLogProps {
  history: TransferHistory[];
  items?: TransferItem[];
}

export default function TransferActivityLog({ history, items = [] }: TransferActivityLogProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateOnly = (date: Date) => {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getItemInfo = (itemId?: string) => {
    if (!itemId || !items || items.length === 0) return null;
    return items.find(item => item.id === itemId);
  };

  const getActionConfig = (action: string) => {
    const configs: Record<string, {
      icon: React.ReactNode;
      label: string;
      color: string;
      bgColor: string;
    }> = {
      'CREATED': {
        icon: <ClipboardList className="h-4 w-4" />,
        label: 'สร้างใบเบิก',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
      },
      'APPROVED': {
        icon: <CheckCircle className="h-4 w-4" />,
        label: 'อนุมัติ',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
      },
      'PREPARED': {
        icon: <Package className="h-4 w-4" />,
        label: 'จัดเตรียม',
        color: 'text-purple-700',
        bgColor: 'bg-purple-100',
      },
      'DELIVERED': {
        icon: <Truck className="h-4 w-4" />,
        label: 'รับเข้า',
        color: 'text-emerald-700',
        bgColor: 'bg-emerald-100',
      },
      'CANCELLED': {
        icon: <XCircle className="h-4 w-4" />,
        label: 'ยกเลิก',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
      },
    };

    return configs[action] || {
      icon: <Clock className="h-4 w-4" />,
      label: action,
      color: 'text-gray-700',
      bgColor: 'bg-gray-100',
    };
  };

  // Group by date
  const groupedHistory = history.reduce((groups, record) => {
    const dateKey = formatDateOnly(record.createdAt);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(record);
    return groups;
  }, {} as Record<string, TransferHistory[]>);

  if (history.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">ยังไม่มีประวัติการดำเนินการ</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-6">
        <div className="space-y-8">
          {Object.entries(groupedHistory).map(([date, records]) => (
            <div key={date}>
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-200"></div>
                <div className="px-3 py-1 bg-gray-100 rounded-full">
                  <span className="text-xs font-medium text-gray-600">{date}</span>
                </div>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Activities for this date */}
              <div className="space-y-4">
                {records.map((record, index) => {
                  const config = getActionConfig(record.action);
                  const item = getItemInfo(record.itemId);
                  const isItemLevel = !!record.itemId;

                  return (
                    <div key={record.id} className="flex gap-4">
                      {/* Timeline connector */}
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center ${config.color}`}>
                          {config.icon}
                        </div>
                        {index < records.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 my-1"></div>
                        )}
                      </div>

                      {/* Activity content */}
                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            {/* Action header */}
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-semibold ${config.color}`}>
                                {config.label}
                              </span>
                              {isItemLevel && item && (
                                <Badge variant="outline" className="text-xs">
                                  {item.product.code}
                                </Badge>
                              )}
                            </div>

                            {/* Product name (if item-level) */}
                            {isItemLevel && item && (
                              <div className="text-sm text-gray-900 mb-1">
                                {item.product.name}
                                {item.product.genericName && (
                                  <span className="text-gray-500 ml-1">
                                    ({item.product.genericName})
                                  </span>
                                )}
                              </div>
                            )}

                            {/* User info */}
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <User className="h-3.5 w-3.5" />
                              <span>
                                {record.changedBySnapshot?.fullName || record.changedBy}
                              </span>
                              {record.changedBySnapshot?.role && (
                                <Badge variant="outline" className="text-xs">
                                  {record.changedBySnapshot.role}
                                </Badge>
                              )}
                            </div>

                            {/* Status change */}
                            {record.fromStatus && record.toStatus && (
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs bg-gray-50">
                                  {record.fromStatus}
                                </Badge>
                                <span className="text-gray-400">→</span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    record.toStatus === 'DELIVERED' ? 'bg-green-50 text-green-800 border-green-200' :
                                    record.toStatus === 'CANCELLED' ? 'bg-red-50 text-red-800 border-red-200' :
                                    record.toStatus === 'PREPARED' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                                    record.toStatus === 'APPROVED' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                                    'bg-yellow-50 text-yellow-800 border-yellow-200'
                                  }`}
                                >
                                  {record.toStatus}
                                </Badge>
                              </div>
                            )}

                            {/* Notes */}
                            {record.notes && (
                              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-700">{record.notes}</p>
                              </div>
                            )}
                          </div>

                          {/* Time */}
                          <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                            <Clock className="h-3 w-3" />
                            {formatTime(record.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}