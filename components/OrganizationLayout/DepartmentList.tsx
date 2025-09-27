// components/OrganizationLayout/DepartmentList.tsx
// DashboardSidebar/DepartmentList - Simple department navigation without grouping
// ✅ NO CHANGES NEEDED - Navigation handled by parent component via onSelectDepartment prop

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DepartmentListProps {
  departments: any[];
  selectedDepartment: any;
  onSelectDepartment: (dept: any) => void;
  collapsed: boolean;
}

export const DepartmentList = ({ 
  departments, 
  selectedDepartment, 
  onSelectDepartment, 
  collapsed 
}: DepartmentListProps) => {
  const renderDepartmentButton = (dept: any) => {
    const IconComponent = dept.icon;
    const isSelected = selectedDepartment?.id === dept.id;
    
    return (
      <Button
        key={dept.id}
        variant={isSelected ? "secondary" : "ghost"}
        className={`${collapsed ? 'w-full justify-center' : 'w-full justify-start'} h-9 relative`}
        onClick={() => onSelectDepartment(dept)}
      >
        <div className={`w-6 h-6 ${dept.color} rounded flex items-center justify-center ${collapsed ? 'mr-0' : 'mr-2'}`}>
          <IconComponent className="w-3 h-3 text-white" />
        </div>
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate">{dept.name}</span>
            {dept.notifications > 0 && (
              <Badge variant="destructive" className="h-5 min-w-5 text-xs p-1">
                {dept.notifications}
              </Badge>
            )}
          </>
        )}
      </Button>
    );
  };

  return (
    <div className="space-y-1">
      {!collapsed && (
        <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          แผนกทั้งหมด
        </div>
      )}

      {/* All Departments - No Grouping */}
      {departments.map(renderDepartmentButton)}
    </div>
  );
};