// components/TransferManagement/shared/TransferPriorityBadge.tsx
// TransferPriorityBadge - Priority badge component

'use client';

import { Badge } from '@/components/ui/badge';
import { TransferPriority } from '@/types/transfer';
import { AlertCircle } from 'lucide-react';

interface TransferPriorityBadgeProps {
  priority: TransferPriority;
}

export default function TransferPriorityBadge({ priority }: TransferPriorityBadgeProps) {
  const priorityConfig = {
    NORMAL: {
      label: 'ปกติ',
      className: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: null,
    },
    URGENT: {
      label: 'ด่วน',
      className: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: <AlertCircle className="w-3 h-3 mr-1" />,
    },
    CRITICAL: {
      label: 'ด่วนมาก',
      className: 'bg-red-100 text-red-800 border-red-200',
      icon: <AlertCircle className="w-3 h-3 mr-1" />,
    },
  };

  const config = priorityConfig[priority];

  return (
    <Badge variant="outline" className={`${config.className} flex items-center w-fit`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}