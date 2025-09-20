// app/org/[orgSlug]/components/DashboardSidebar/index.tsx
// DashboardSidebar - Main sidebar navigation component

import React from 'react';
import { SidebarHeader } from './SidebarHeader';
import { SidebarNavigation } from './SidebarNavigation';
import { DepartmentList } from './DepartmentList';
import { SidebarFooter } from './SidebarFooter';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DashboardSidebarProps {
  organization: any;
  departments: any[];
  selectedDepartment: any;
  onSelectDepartment: (dept: any) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const DashboardSidebar = ({
  organization,
  departments,
  selectedDepartment,
  onSelectDepartment,
  collapsed,
  onToggleCollapse,
  searchTerm,
  onSearchChange
}: DashboardSidebarProps) => {
  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`${collapsed ? 'w-16' : 'w-80'} h-screen bg-white border-r border-gray-200 transition-all duration-200 flex flex-col fixed left-0 top-0 z-10`}>
      <SidebarHeader
        organization={organization}
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-3 flex-shrink-0">
          <SidebarNavigation 
            collapsed={collapsed}
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <DepartmentList
            departments={filteredDepartments}
            selectedDepartment={selectedDepartment}
            onSelectDepartment={onSelectDepartment}
            collapsed={collapsed}
          />
        </div>
      </div>

      <SidebarFooter collapsed={collapsed} />
    </div>
  );
};