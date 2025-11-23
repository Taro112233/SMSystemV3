// components/TransferManagement/shared/TransferStatusBadge.tsx
// TransferStatusBadge - Status badge component

'use client';

import { Badge } from '@/components/ui/badge';
import { TransferStatus } from '@/types/transfer';

interface TransferStatusBadgeProps {
  status: TransferStatus;
}

export default function TransferStatusBadge({ status }: TransferStatusBadgeProps) {
  const statusConfig = {
    PENDING: {
      label: 'รออนุมัติ',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    APPROVED: {
      label: 'อนุมัติแล้ว',
      className: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    PREPARED: {
      label: 'จัดเตรียมแล้ว',
      className: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    DELIVERED: {
      label: 'รับเข้าแล้ว',
      className: 'bg-green-100 text-green-800 border-green-200',
    },
    PARTIAL: {
      label: 'รับบางส่วน',
      className: 'bg-orange-100 text-orange-800 border-orange-200',
    },
    COMPLETED: {
      label: 'เสร็จสมบูรณ์',
      className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    CANCELLED: {
      label: 'ยกเลิก',
      className: 'bg-red-100 text-red-800 border-red-200',
    },
  };

  const config = statusConfig[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}