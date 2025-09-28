// components/OrganizationLayout/DepartmentList.tsx - Simplified Version without Categories
// DashboardSidebar/DepartmentList - Department navigation using real API data

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getIconComponent, type FrontendDepartment } from '@/lib/department-helpers';

interface DepartmentListProps {
  departments: FrontendDepartment[];
  selectedDepartment: FrontendDepartment | null;
  onSelectDepartment: (dept: FrontendDepartment) => void;
  collapsed: boolean;
}

export const DepartmentList = ({ 
  departments, 
  selectedDepartment, 
  onSelectDepartment, 
  collapsed 
}: DepartmentListProps) => {
  
  // ✅ Safe icon rendering using department-helpers
  const renderIcon = (dept: FrontendDepartment) => {
    try {
      const IconComponent = getIconComponent(dept.icon || 'BUILDING');
      return <IconComponent className="w-3 h-3 text-white" />;
    } catch (error) {
      console.error('Error rendering department icon:', error, dept);
      // Fallback to Building icon
      const { Building } = require('lucide-react');
      return <Building className="w-3 h-3 text-white" />;
    }
  };

  const renderDepartmentButton = (dept: FrontendDepartment) => {
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

      {/* Render all departments in a simple list */}
      {departments.map(renderDepartmentButton)}
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && departments.length > 0 && !collapsed && (
        <div className="px-3 py-1 text-xs text-gray-400 border-t mt-2 pt-2">
          <div>Total: {departments.length} departments</div>
        </div>
      )}
    </div>
  );
};