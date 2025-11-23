// components/TransferManagement/TransferDetail/TransferStatusTimeline.tsx
// TransferStatusTimeline - Visual timeline

'use client';

import { TransferStatus } from '@/types/transfer';
import { 
  ClipboardList, 
  CheckCircle, 
  Package, 
  CheckCheck,
  XCircle 
} from 'lucide-react';

interface TransferStatusTimelineProps {
  status: TransferStatus;
  requestedAt: Date;
  approvedAt?: Date;
  preparedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
}

export default function TransferStatusTimeline({
  status,
  requestedAt,
  approvedAt,
  preparedAt,
  deliveredAt,
  cancelledAt,
}: TransferStatusTimelineProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const steps = [
    {
      label: 'ส่งคำขอ',
      status: 'PENDING',
      icon: ClipboardList,
      date: requestedAt,
      completed: true,
    },
    {
      label: 'อนุมัติ',
      status: 'APPROVED',
      icon: CheckCircle,
      date: approvedAt,
      completed: !!approvedAt,
    },
    {
      label: 'จัดเตรียม',
      status: 'PREPARED',
      icon: Package,
      date: preparedAt,
      completed: !!preparedAt,
    },
    {
      label: 'รับเข้าแล้ว',
      status: 'DELIVERED',
      icon: CheckCheck,
      date: deliveredAt,
      completed: !!deliveredAt,
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
            <div className="text-sm text-red-700">
              ยกเลิกเมื่อ {formatDate(cancelledAt)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = status === step.status;
          const isCompleted = step.completed;

          return (
            <div key={step.status} className="flex-1 relative">
              <div className="flex flex-col items-center">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted
                      ? 'bg-green-100 text-green-600'
                      : isActive
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                {/* Label */}
                <div
                  className={`text-sm font-medium mt-2 ${
                    isCompleted || isActive ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </div>

                {/* Date */}
                {step.date && (
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(step.date)}
                  </div>
                )}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-6 left-1/2 w-full h-0.5 transition-colors ${
                    steps[index + 1].completed ? 'bg-green-300' : 'bg-gray-200'
                  }`}
                  style={{ transform: 'translateY(-50%)' }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}