// app/org/[orgSlug]/components/OrganizationOverview/QuickActions.tsx
// OrganizationOverview/QuickActions - Quick action buttons grouped by function

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, Plus, FolderTree, Calculator,
  BarChart3, TrendingUp, Activity, FileText,
  Users, Building2, Settings
} from 'lucide-react';

export const QuickActions = () => {
  const actionGroups = [
    {
      title: 'จัดการสินค้า',
      icon: Package,
      iconColor: 'text-blue-500',
      actions: [
        { icon: Package, label: 'รายการสินค้าทั้งหมด', onClick: () => console.log('All products') },
        { icon: FolderTree, label: 'หมวดหมู่สินค้า', onClick: () => console.log('Product categories') },
        { icon: Calculator, label: 'ตั้งค่าหน่วยนับ', onClick: () => console.log('Unit settings') }
      ]
    },
    {
      title: 'การจัดการองค์กร',
      icon: Settings,
      iconColor: 'text-purple-500',
      actions: [
        { icon: Building2, label: 'ตั้งค่าองค์กร', onClick: () => console.log('Organization settings') },
        { icon: Settings, label: 'ตั้งค่าหน่วยงาน', onClick: () => console.log('Department settings') },
        { icon: Users, label: 'จัดการสมาชิก', onClick: () => console.log('Manage members') }
      ]
    },
    {
      title: 'รายงานและสถิติ',
      icon: BarChart3,
      iconColor: 'text-green-500',
      actions: [
        { icon: TrendingUp, label: 'รายงานสต็อก', onClick: () => console.log('Stock reports') },
        { icon: Activity, label: 'รายงานการเคลื่อนไหวสินค้า', onClick: () => console.log('Movement reports') },
        { icon: FileText, label: 'รายงานการเบิกจ่าย', onClick: () => console.log('Transfer reports') },
        { icon: FileText, label: 'รายงานกิจกรรม', onClick: () => console.log('Activity reports') }
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