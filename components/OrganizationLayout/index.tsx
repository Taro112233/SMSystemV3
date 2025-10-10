// FILE: components/OrganizationLayout/index.tsx
// UPDATED: Enhanced sidebar with mobile overlay and better responsive behavior
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
  color: string;
  icon: string;
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

interface UserData {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email?: string;
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
  user?: UserData | null;
  userRole?: string | null;
  onLogout?: () => Promise<void>;
}

export const DashboardSidebar = ({
  organization,
  departments,
  selectedDepartment,
  onSelectDepartment,
  collapsed,
  onToggleCollapse,
  searchTerm,
  onSearchChange,
  user,
  userRole,
  onLogout,
}: DashboardSidebarProps) => {
  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ UPDATED: Enhanced mobile detection
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // ✅ UPDATED: Handle mobile overlay clicks
  const handleOverlayClick = () => {
    if (isMobile && !collapsed) {
      onToggleCollapse();
    }
  };

  return (
    <>
      {/* ✅ NEW: Mobile overlay when sidebar is open */}
      {isMobile && !collapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={handleOverlayClick}
          aria-label="Close sidebar"
        />
      )}

      {/* ✅ UPDATED: Enhanced sidebar with better mobile support */}
      <div className={`
        ${collapsed ? 'w-16' : 'w-80'} 
        h-screen bg-white border-r border-gray-200 
        transition-all duration-300 ease-in-out 
        flex flex-col 
        fixed left-0 top-0 z-30
        ${isMobile && collapsed ? '-translate-x-full' : 'translate-x-0'}
        lg:translate-x-0
      `}>
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

        <SidebarFooter 
          collapsed={collapsed}
          user={user}
          userRole={userRole}
          onLogout={onLogout}
        />
      </div>
    </>
  );
};