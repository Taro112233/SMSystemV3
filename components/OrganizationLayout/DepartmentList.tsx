// components/OrganizationLayout/DepartmentList.tsx - STRING-BASED ICON APPROACH
// DashboardSidebar/DepartmentList - Simple department navigation with safe icon rendering

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getIconComponent } from '@/lib/department-helpers';

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
  
  // ✅ Safe icon rendering using string-based approach
  const renderIcon = (dept: any) => {
    try {
      // dept.icon is now a string (e.g., "BUILDING", "HOSPITAL")
      const IconComponent = getIconComponent(dept.icon || 'BUILDING');
      return <IconComponent className="w-3 h-3 text-white" />;
    } catch (error) {
      console.error('Error rendering department icon:', error, dept);
      // Import Building directly as fallback
      const { Building } = require('lucide-react');
      return <Building className="w-3 h-3 text-white" />;
    }
  };

  const renderDepartmentButton = (dept: any) => {
    const isSelected = selectedDepartment?.id === dept.id;
    
    return (
      <Button
        key={dept.id}
        variant={isSelected ? "secondary" : "ghost"}
        className={`${collapsed ? 'w-full justify-center' : 'w-full justify-start'} h-9 relative`}
        onClick={() => onSelectDepartment(dept)}
      >
        <div className={`w-6 h-6 ${dept.color || 'bg-gray-500'} rounded flex items-center justify-center ${collapsed ? 'mr-0' : 'mr-2'}`}>
          {renderIcon(dept)}
        </div>
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate">{dept.name}</span>
            {(dept.notifications || 0) > 0 && (
              <Badge variant="destructive" className="h-5 min-w-5 text-xs p-1">
                {dept.notifications}
              </Badge>
            )}
          </>
        )}
      </Button>
    );
  };

  // Safety check for departments array
  if (!departments || !Array.isArray(departments)) {
    console.warn('Invalid departments data:', departments);
    return (
      <div className="space-y-1">
        {!collapsed && (
          <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            แผนกทั้งหมด
          </div>
        )}
        <div className="px-3 py-2 text-sm text-gray-500">
          ไม่พบข้อมูลแผนก
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {!collapsed && (
        <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          แผนกทั้งหมด ({departments.length})
        </div>
      )}

      {/* All Departments */}
      {departments.map(renderDepartmentButton)}
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && departments.length > 0 && (
        <div className="px-3 py-1 text-xs text-gray-400">
          Sample: {departments[0]?.name} - Icon: {departments[0]?.icon} - Color: {departments[0]?.color}
        </div>
      )}
    </div>
  );
};