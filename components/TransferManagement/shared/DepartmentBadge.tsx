// components/TransferManagement/shared/DepartmentBadge.tsx
// DepartmentBadge - Department name badge

'use client';

import { Badge } from '@/components/ui/badge';

interface DepartmentBadgeProps {
  name: string;
  className?: string;
}

export default function DepartmentBadge({ name, className = '' }: DepartmentBadgeProps) {
  return (
    <Badge variant="outline" className={`bg-blue-50 text-blue-700 border-blue-200 ${className}`}>
      {name}
    </Badge>
  );
}