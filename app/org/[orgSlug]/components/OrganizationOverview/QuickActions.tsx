// app/org/[orgSlug]/components/OrganizationOverview/QuickActions.tsx
// OrganizationOverview/QuickActions - Quick action buttons grouped by function

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Zap, Plus, AlertTriangle, Clock, BarChart3, TrendingUp, Activity, FileText,
  Settings, UserPlus, Building2, Shield
} from 'lucide-react';

export const QuickActions = () => {
  const actionGroups = [
    {
      title: 'การจัดการด่วน',
      icon: Zap,
      iconColor: 'text-blue-500',
      actions: [
        { icon: Plus, label: 'สร้างใบเบิกด่วน', onClick: () => console.log('Create urgent transfer') },
        { icon: AlertTriangle, label: 'ตรวจสอบสต็อกต่ำ', onClick: () => console.log('Check low stock') },
        { icon: Clock, label: 'รายการรออนุมัติ', onClick: () => console.log('Pending approvals') }
      ]
    },
    {
      title: 'รายงานและสถิติ',
      icon: BarChart3,
      iconColor: 'text-green-500',
      actions: [
        { icon: TrendingUp, label: 'รายงานสต็อก', onClick: () => console.log('Stock reports') },
        { icon: Activity, label: 'กิจกรรมแผนก', onClick: () => console.log('Department activity') },
        { icon: FileText, label: 'รายงานการเบิกจ่าย', onClick: () => console.log('Transfer reports') }
      ]
    },
    {
      title: 'การจัดการองค์กร',
      icon: Settings,
      iconColor: 'text-purple-500',
      actions: [
        { icon: UserPlus, label: 'จัดการสมาชิก', onClick: () => console.log('Manage users') },
        { icon: Building2, label: 'จัดการแผนก', onClick: () => console.log('Manage departments') },
        { icon: Shield, label: 'ตั้งค่าสิทธิ์', onClick: () => console.log('Manage permissions') }
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {actionGroups.map((group, groupIndex) => {
        const GroupIcon = group.icon;
        return (
          <Card key={groupIndex}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GroupIcon className={`w-5 h-5 ${group.iconColor}`} />
                {group.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {group.actions.map((action, actionIndex) => {
                  const ActionIcon = action.icon;
                  return (
                    <Button
                      key={actionIndex}
                      className="w-full justify-start"
                      variant="outline"
                      onClick={action.onClick}
                    >
                      <ActionIcon className="w-4 h-4 mr-2" />
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};