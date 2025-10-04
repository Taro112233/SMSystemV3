// FILE: components/OrganizationDashboard/DepartmentOverview.tsx
// OrganizationOverview/DepartmentOverview - Department grid with quick overview
// ============================================

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Package, AlertTriangle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { getIconComponent, type FrontendDepartment } from '@/lib/department-helpers';

interface DepartmentOverviewProps {
  departments: FrontendDepartment[];
  onSelectDepartment: (dept: FrontendDepartment) => void;
}

export const DepartmentOverview = ({
  departments,
  onSelectDepartment
}: DepartmentOverviewProps) => {
  
  // Sort departments: show those with alerts first
  const sortedDepartments = [...departments].sort((a, b) => {
    const alertsA = (a.lowStock || 0) + (a.notifications || 0);
    const alertsB = (b.lowStock || 0) + (b.notifications || 0);
    return alertsB - alertsA;
  });

  // Limit to top 6 departments for overview
  const topDepartments = sortedDepartments.slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>ภาพรวมหน่วยงาน</CardTitle>
          <Badge variant="secondary">
            {departments.length} หน่วยงาน
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topDepartments.map((dept) => {
            const IconComponent = getIconComponent(dept.icon || 'BUILDING');
            const hasLowStock = (dept.lowStock || 0) > 0;
            
            return (
              <div
                key={dept.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                onClick={() => onSelectDepartment(dept)}
              >
                {/* Department Icon */}
                <div className={`w-12 h-12 ${dept.color || 'bg-gray-500'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>

                {/* Department Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 truncate">
                      {dept.name}
                    </h4>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      <span>{dept.stockItems || 0} รายการ</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {hasLowStock ? (
                        <>
                          <AlertTriangle className="w-3 h-3 text-orange-600" />
                          <span className="text-orange-600">
                            {dept.lowStock} ใกล้หมด
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                          <span className="text-green-600">
                            สต็อกปกติ
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action */}
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
              </div>
            );
          })}

          {/* View All Button */}
          {departments.length > 6 && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                // This could navigate to a full departments list page
                console.log('View all departments');
              }}
            >
              <Building2 className="w-4 h-4 mr-2" />
              ดูทั้งหมด ({departments.length} หน่วยงาน)
            </Button>
          )}

          {/* Empty State */}
          {departments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>ยังไม่มีหน่วยงาน</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};