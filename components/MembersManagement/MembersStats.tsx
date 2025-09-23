// components/MembersManagement/MembersStats.tsx
// MembersManagement/MembersStats - Statistics overview cards

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, Clock, Shield, Crown, User } from 'lucide-react';

interface MembersStatsProps {
  stats: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    owners: number;
    admins: number;
    members: number;
  };
}

export const MembersStats = ({ stats }: MembersStatsProps) => {
  const statCards = [
    {
      label: 'สมาชิกทั้งหมด',
      value: stats.total,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'ใช้งานอยู่',
      value: stats.active,
      icon: UserCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      label: 'รอยืนยัน',
      value: stats.pending,
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      label: 'เจ้าของ/ผู้จัดการ',
      value: stats.owners + stats.admins,
      icon: Shield,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <IconComponent className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};