// app/org/[orgSlug]/components/OrganizationOverview/OrganizationStats.tsx
// OrganizationOverview/OrganizationStats - Main organization statistics cards

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package, AlertTriangle, FileText, Users } from 'lucide-react';

interface OrganizationStatsProps {
  stats: {
    totalProducts: number;
    lowStockItems: number;
    pendingTransfers: number;
    activeUsers: number;
  };
}

export const OrganizationStats = ({ stats }: OrganizationStatsProps) => {
  const statCards = [
    {
      label: 'สินค้าทั้งหมด',
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: 'text-blue-500'
    },
    {
      label: 'ใกล้หมด',
      value: stats.lowStockItems,
      icon: AlertTriangle,
      color: 'text-orange-500'
    },
    {
      label: 'รอดำเนินการ',
      value: stats.pendingTransfers,
      icon: FileText,
      color: 'text-blue-500'
    },
    {
      label: 'ผู้ใช้งาน',
      value: stats.activeUsers,
      icon: Users,
      color: 'text-green-500'
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