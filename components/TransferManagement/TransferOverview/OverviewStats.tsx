// components/TransferManagement/TransferOverview/OverviewStats.tsx
// OverviewStats - Stats cards component

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { 
  ClipboardList, 
  CheckCircle, 
  Package, 
  CheckCheck 
} from 'lucide-react';

interface OverviewStatsProps {
  pending: number;
  approved: number;
  prepared: number;
  completed: number;
}

export default function OverviewStats({
  pending,
  approved,
  prepared,
  completed,
}: OverviewStatsProps) {
  const stats = [
    {
      label: 'รออนุมัติ',
      value: pending,
      icon: ClipboardList,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'อนุมัติแล้ว',
      value: approved,
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'จัดเตรียมแล้ว',
      value: prepared,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'เสร็จสมบูรณ์',
      value: completed,
      icon: CheckCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}