// app/org/[orgSlug]/components/MembersManagement/MembersStats.tsx
// MembersManagement/MembersStats - Member statistics cards

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Shield, 
  Crown, 
  UserPlus 
} from 'lucide-react';
import { MembersStats as MembersStatsType } from './index';

interface MembersStatsProps {
  stats: MembersStatsType;
}

export const MembersStats = ({ stats }: MembersStatsProps) => {
  const statCards = [
    {
      label: 'สมาชิกทั้งหมด',
      value: stats.totalMembers,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'สมาชิกที่ใช้งาน',
      value: stats.activeMembers,
      icon: UserCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      label: 'รอการยืนยัน',
      value: stats.pendingInvitations,
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'ผู้ดูแลระบบ',
      value: stats.admins,
      icon: Shield,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'เจ้าขององค์กร',
      value: stats.owners,
      icon: Crown,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'เข้าร่วมล่าสุด (30 วัน)',
      value: stats.recentJoins,
      icon: UserPlus,
      color: 'text-teal-500',
      bgColor: 'bg-teal-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <IconComponent className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};