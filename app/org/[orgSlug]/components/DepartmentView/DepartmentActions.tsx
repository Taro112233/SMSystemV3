// app/org/[orgSlug]/components/DepartmentView/DepartmentActions.tsx
// DepartmentView/DepartmentActions - Department management action buttons

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ClipboardList, Eye, Edit, RefreshCw, Upload, TrendingUp, Plus, FileText, 
  CheckCircle2, Download
} from 'lucide-react';

export const DepartmentActions = () => {
  const actionGroups = [
    {
      title: 'การจัดการสต็อก',
      icon: ClipboardList,
      actions: [
        { icon: Eye, label: 'ดูสต็อกสินค้า', onClick: () => console.log('View stock') },
        { icon: Edit, label: 'ปรับสต็อก', onClick: () => console.log('Adjust stock') },
        { icon: RefreshCw, label: 'นับสต็อก', onClick: () => console.log('Stock count') },
        { icon: Upload, label: 'เพิ่มสินค้า', onClick: () => console.log('Add products') }
      ]
    },
    {
      title: 'การเบิกจ่าย',
      icon: TrendingUp,
      actions: [
        { icon: Plus, label: 'สร้างใบเบิก', onClick: () => console.log('Create transfer') },
        { icon: FileText, label: 'ดูรายการเบิก', onClick: () => console.log('View transfers') },
        { icon: CheckCircle2, label: 'อนุมัติการเบิก', onClick: () => console.log('Approve transfers') },
        { icon: Download, label: 'รับสินค้า', onClick: () => console.log('Receive items') }
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {actionGroups.map((group, groupIndex) => {
        const GroupIcon = group.icon;
        return (
          <Card key={groupIndex}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GroupIcon className="w-5 h-5" />
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