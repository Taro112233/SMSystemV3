// components/OrganizationDashboard/index.tsx
// OrganizationOverview - Main organization dashboard view

import React from 'react';
import { DepartmentOverview } from './DepartmentOverview';
import { OrganizationPerformance } from './OrganizationPerformance';
import { OrganizationStats } from './OrganizationStats';
import { QuickActions } from './QuickActions';
import { RecentActivity } from './RecentActivity';

interface OrganizationOverviewProps {
  organization: any;
  departments: any[];
  recentActivities: any[];
  onSelectDepartment: (dept: any) => void;
}

export const OrganizationOverview = ({
  organization,
  departments,
  recentActivities,
  onSelectDepartment
}: OrganizationOverviewProps) => {
  return (
    <div className="space-y-6">
      <OrganizationStats stats={organization.stats} />
      
      <QuickActions />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DepartmentOverview 
          departments={departments}
          onSelectDepartment={onSelectDepartment}
        />
        <RecentActivity activities={recentActivities} />
      </div>
      
      <OrganizationPerformance organization={organization} />
    </div>
  );
};