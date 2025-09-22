// app/org/[orgSlug]/components/OrganizationOverview/DepartmentOverview.tsx
// OrganizationOverview/DepartmentOverview - Grid of departments with stats and click handler

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';

interface DepartmentOverviewProps {
  departments: any[];
  onSelectDepartment: (dept: any) => void;
}

export const DepartmentOverview = ({ 
  departments, 
  onSelectDepartment 
}: DepartmentOverviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          แผนกทั้งหมด
          <Badge variant="secondary">{departments.length} แผนก</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {departments.map((dept) => {
            const IconComponent = dept.icon;
            return (
              <div 
                key={dept.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => onSelectDepartment(dept)}
              >
                <div className={`w-10 h-10 ${dept.color} rounded-lg flex items-center justify-center`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 truncate">{dept.name}</h3>
                    {dept.notifications > 0 && (
                      <Badge variant="destructive" className="h-5 min-w-5 text-xs px-1">
                        {dept.notifications}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <span>{dept.stockItems} สินค้า</span>
                    <span>{dept.memberCount} คน</span>
                    <span className={dept.lowStock > 0 ? 'text-orange-600' : 'text-green-600'}>
                      {dept.lowStock > 0 ? `${dept.lowStock} ใกล้หมด` : 'สต็อกปกติ'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};