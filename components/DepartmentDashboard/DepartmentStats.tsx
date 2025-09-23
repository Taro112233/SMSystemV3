// components/DepartmentDashboard/DepartmentStats.tsx
// DepartmentView/DepartmentStats - Department-specific statistics cards

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package, AlertTriangle, Users, Bell } from 'lucide-react';

interface DepartmentStatsProps {
  department: {
    stockItems: number;
    lowStock: number;
    memberCount: number;
    notifications: number;
  };
}

export const DepartmentStats = ({ department }: DepartmentStatsProps) => {
  const statCards = [
    {
      label: 'สินค้าทั้งหมด',
      value: department.stockItems,
      icon: Package,
      color: 'text-blue-500'
    },
    {
      label: 'ใกล้หมด',
      value: department.lowStock,
      icon: AlertTriangle,
      color: 'text-orange-500'
    },
    {
      label: 'สมาชิก',
      value: department.memberCount,
      icon: Users,
      color: 'text-green-500'
    },
    {
      label: 'แจ้งเตือน',
      value: department.notifications,
      icon: Bell,
      color: 'text-red-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <IconComponent className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};