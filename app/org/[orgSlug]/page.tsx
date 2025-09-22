// app/org/[orgSlug]/page.tsx
// OrganizationDashboard - Main dashboard orchestrator component
"use client";

import React, { useState } from 'react';
import { organization, departments, recentActivities } from '../../../data/orgMockData';
import { DashboardSidebar } from '../../../components/OrganizationLayout';
import { DashboardHeader } from '../../../components/OrganizationLayout/OrganizationHeader';
import { OrganizationOverview } from '../../../components/OrganizationDashboard';
import { DepartmentView } from '../../../components/DepartmentDashboard';

const OrganizationDashboard = () => {
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Fixed Sidebar */}
      <DashboardSidebar
        organization={organization}
        departments={departments}
        selectedDepartment={selectedDepartment}
        onSelectDepartment={setSelectedDepartment}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col ${sidebarCollapsed ? 'ml-16' : 'ml-80'} transition-all duration-200`}>
        <DashboardHeader
          organization={organization}
          selectedDepartment={selectedDepartment}
        />

        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          {selectedDepartment ? (
            <DepartmentView department={selectedDepartment} />
          ) : (
            <OrganizationOverview
              organization={organization}
              departments={departments}
              recentActivities={recentActivities}
              onSelectDepartment={setSelectedDepartment}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default OrganizationDashboard;