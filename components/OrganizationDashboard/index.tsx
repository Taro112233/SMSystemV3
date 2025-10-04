// FILE: components/OrganizationDashboard/index.tsx
// OrganizationOverview - Main organization dashboard view

import React from 'react';
import { DepartmentOverview } from './DepartmentOverview';
import { OrganizationPerformance } from './OrganizationPerformance';
import { OrganizationStats } from './OrganizationStats';
import { QuickActions } from './QuickActions';
import { RecentActivity, type ActivityItem } from './RecentActivity';

// ✅ Import FrontendDepartment type from helpers instead of defining locally
import type { FrontendDepartment } from '@/lib/department-helpers';

// ✅ Proper type definitions
interface OrganizationStats {
  totalProducts?: number;
  lowStockItems?: number;
  pendingTransfers?: number;
  activeUsers?: number;
  totalValue?: string;
  departments?: number;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  stats?: OrganizationStats;
}

interface OrganizationOverviewProps {
  organization: Organization;
  departments: FrontendDepartment[];  // ✅ Use FrontendDepartment from helpers
  recentActivities: ActivityItem[];
  onSelectDepartment: (dept: FrontendDepartment) => void;  // ✅ Match type
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