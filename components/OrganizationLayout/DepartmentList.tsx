// components/OrganizationLayout/DepartmentList.tsx - Simplified Version without Categories
// DashboardSidebar/DepartmentList - Department navigation using real API data

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building } from 'lucide-react'; // ✅ Import Building as fallback
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
  
  // ✅ Safe icon rendering with pre-imported fallback
  const renderIcon = (dept: FrontendDepartment) => {
    try {
      const IconComponent = getIconComponent(dept.icon || 'BUILDING');
      return <IconComponent className="w-4 h-4 text-white" />;
    } catch (error) {
      console.error('Error rendering department icon:', error, dept);
      // ✅ Use pre-imported Building icon as fallback
      return <Building className="w-4 h-4 text-white" />;
    }
  };

  const renderDepartmentButton = (dept: FrontendDepartment) => {
    const isSelected = selectedDepartment?.id === dept.id;
    
    return (
      <Button
        key={dept.id}
        variant={isSelected ? "secondary" : "ghost"}
        className={`${collapsed ? 'w-full justify-center px-0' : 'w-full justify-start'} h-10 relative`}
        onClick={() => onSelectDepartment(dept)}
      >
        {/* ✅ UPDATED: ปรับปรุงการจัดวาง icon container */}
        <div className={`
          ${collapsed ? 'w-6.5 h-6.5' : 'w-6.5 h-6.5'} 
          ${dept.color || 'bg-gray-500'} 
          rounded 
          flex items-center justify-center 
          flex-shrink-0
          ${collapsed ? 'mx-auto' : 'mr-3'}
        `}>
          {renderIcon(dept)}
        </div>
        
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate text-sm font-medium">
              {dept.name}
            </span>
            {(dept.notifications || 0) > 0 && (
              <Badge variant="destructive" className="h-5 min-w-5 text-xs p-1 ml-2">
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
            หน่วยงานทั้งหมด
          </div>
        )}
        <div className="px-3 py-2 text-sm text-gray-500">
          ไม่พบข้อมูลหน่วยงาน
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {!collapsed && (
        <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          หน่วยงานทั้งหมด ({departments.length})
        </div>
      )}

      {/* Render all departments in a simple list */}
      <div className={collapsed ? 'space-y-2' : 'space-y-1'}>
        {departments.map(renderDepartmentButton)}
      </div>
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && departments.length > 0 && !collapsed && (
        <div className="px-3 py-1 text-xs text-gray-400 border-t mt-2 pt-2">
          <div>Total: {departments.length} departments</div>
        </div>
      )}
    </div>
  );
};