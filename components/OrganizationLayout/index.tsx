// FILE: components/OrganizationLayout/index.tsx
// DashboardSidebar - UPDATED to pass Icon & Color to child components
// ============================================

import React from 'react';
import { SidebarHeader } from './SidebarHeader';
import { SidebarNavigation } from './SidebarNavigation';
import { DepartmentList } from './DepartmentList';
import { SidebarFooter } from './SidebarFooter';
import type { FrontendDepartment } from '@/lib/department-helpers';

interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  color: string;         // ✅ CRITICAL: Receive color
  icon: string;          // ✅ CRITICAL: Receive icon
  userRole: string;
  stats: {
    totalProducts: number;
    lowStockItems: number;
    pendingTransfers: number;
    activeUsers: number;
    totalValue: string;
    departments: number;
  };
}

interface DashboardSidebarProps {
  organization: OrganizationData;
  departments: FrontendDepartment[];
  selectedDepartment: FrontendDepartment | null;
  onSelectDepartment: (dept: FrontendDepartment) => void;
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

  // ✅ DEBUG: Log organization data to verify color & icon are passed
  console.log('🎨 DashboardSidebar - Organization:', {
    name: organization.name,
    color: organization.color,
    icon: organization.icon,
    logo: organization.logo
  });

  return (
    <div className={`${collapsed ? 'w-16' : 'w-80'} h-screen bg-white border-r border-gray-200 transition-all duration-200 flex flex-col fixed left-0 top-0 z-10`}>
      {/* ✅ CRITICAL: Pass full organization object with color & icon */}
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