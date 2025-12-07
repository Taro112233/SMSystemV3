// components/TransferManagement/TransferDetail/TransferTimeline.tsx
// TransferTimeline - Same as before

'use client';

import { TransferStatus, TransferItem } from '@/types/transfer';
import { 
  ClipboardList, 
  CheckCircle, 
  Package, 
  CheckCheck,
  XCircle,
  Clock
} from 'lucide-react';

interface TransferTimelineProps {
  status: TransferStatus;
  requestedAt: Date;
  approvedAt?: Date;
  preparedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  items: TransferItem[];
}

export default function TransferTimeline({
  status,
  requestedAt,
  approvedAt,
  preparedAt,
  deliveredAt,
  cancelledAt,
  items,
}: TransferTimelineProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const activeItems = items.filter(item => item.status !== 'CANCELLED');
  const totalActiveItems = activeItems.length;

  const approvedItems = activeItems.filter(item => 
    item.status === 'APPROVED' || 
    item.status === 'PREPARED' || 
    item.status === 'DELIVERED'
  );
  const preparedItems = activeItems.filter(item => 
    item.status === 'PREPARED' || 
    item.status === 'DELIVERED'
  );
  const deliveredItems = activeItems.filter(item => item.status === 'DELIVERED');

  const allApproved = approvedItems.length === totalActiveItems && totalActiveItems > 0;
  const someApproved = approvedItems.length > 0 && approvedItems.length < totalActiveItems;

  const allPrepared = preparedItems.length === totalActiveItems && totalActiveItems > 0;
  const somePrepared = preparedItems.length > 0 && preparedItems.length < totalActiveItems;

  const allDelivered = deliveredItems.length === totalActiveItems && totalActiveItems > 0;
  const someDelivered = deliveredItems.length > 0 && deliveredItems.length < totalActiveItems;

  const getLatestApprovedAt = () => {
    if (approvedItems.length === 0) return null;
    const dates = approvedItems
      .map(item => item.approvedAt)
      .filter((date): date is Date => date !== null && date !== undefined);
    if (dates.length === 0) return null;
    return new Date(Math.max(...dates.map(d => new Date(d).getTime())));
  };

  const getLatestPreparedAt = () => {
    if (preparedItems.length === 0) return null;
    const dates = preparedItems
      .map(item => item.preparedAt)
      .filter((date): date is Date => date !== null && date !== undefined);
    if (dates.length === 0) return null;
    return new Date(Math.max(...dates.map(d => new Date(d).getTime())));
  };

  const getLatestDeliveredAt = () => {
    if (deliveredItems.length === 0) return null;
    const dates = deliveredItems
      .map(item => item.deliveredAt)
      .filter((date): date is Date => date !== null && date !== undefined);
    if (dates.length === 0) return null;
    return new Date(Math.max(...dates.map(d => new Date(d).getTime())));
  };

  const approveStepState = allApproved ? 'completed' : someApproved ? 'partial' : 'pending';
  const prepareStepState = allPrepared ? 'completed' : somePrepared ? 'partial' : 'pending';
  const deliverStepState = allDelivered ? 'completed' : someDelivered ? 'partial' : 'pending';

  const steps = [
    {
      label: 'ส่งคำขอ',
      status: 'PENDING',
      icon: ClipboardList,
      date: requestedAt,
      state: 'completed',
      count: null,
    },
    {
      label: 'อนุมัติ',
      status: 'APPROVED',
      icon: someApproved ? Clock : CheckCircle,
      date: allApproved ? approvedAt : someApproved ? getLatestApprovedAt() : null,
      state: approveStepState,
      count: someApproved ? `${approvedItems.length}/${totalActiveItems}` : null,
    },
    {
      label: 'จัดเตรียม',
      status: 'PREPARED',
      icon: somePrepared ? Clock : Package,
      date: allPrepared ? preparedAt : somePrepared ? getLatestPreparedAt() : null,
      state: prepareStepState,
      count: somePrepared ? `${preparedItems.length}/${totalActiveItems}` : null,
    },
    {
      label: 'รับเข้าแล้ว',
      status: 'DELIVERED',
      icon: someDelivered ? Clock : CheckCheck,
      date: allDelivered ? deliveredAt : someDelivered ? getLatestDeliveredAt() : null,
      state: deliverStepState,
      count: someDelivered ? `${deliveredItems.length}/${totalActiveItems}` : null,
    },
  ];

  if (status === 'CANCELLED' && cancelledAt) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <div className="text-lg font-semibold text-red-900">ใบเบิกถูกยกเลิก</div>
            <div className="text-sm text-red-700">ยกเลิกเมื่อ {formatDate(cancelledAt)}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center relative">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = status === step.status;
          const isLast = index === steps.length - 1;

          const getStepColor = () => {
            if (step.state === 'completed') return 'bg-green-100 text-green-600';
            if (step.state === 'partial') return 'bg-yellow-100 text-yellow-600';
            if (isActive) return 'bg-blue-100 text-blue-600';
            return 'bg-gray-100 text-gray-400';
          };

          const getTextColor = () => {
            if (step.state === 'completed' || step.state === 'partial') return 'text-gray-900';
            if (isActive) return 'text-gray-900';
            return 'text-gray-500';
          };

          const getConnectorColor = () => {
            if (steps[index + 1]?.state === 'completed') return 'bg-green-400';
            if (steps[index + 1]?.state === 'partial') return 'bg-yellow-400';
            return 'bg-gray-200';
          };

          return (
            <div key={step.status} className="flex-1 relative">
              <div className="flex flex-col items-center relative z-10">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${getStepColor()}`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex items-center gap-1 mt-2">
                  <div className={`text-sm font-medium ${getTextColor()}`}>
                    {step.label}
                  </div>
                  {step.count && (
                    <div className="text-xs text-yellow-700 font-medium">
                      ({step.count})
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-500 mt-1 h-4">
                  {step.date ? formatDate(step.date) : '-'}
                </div>
              </div>

              {!isLast && (
                <div
                  className={`absolute top-6 left-1/2 w-full h-0.5 transition-colors ${getConnectorColor()}`}
                  style={{ zIndex: 0 }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}