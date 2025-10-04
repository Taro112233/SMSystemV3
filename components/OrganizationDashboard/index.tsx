// components/OrganizationDashboard/index.tsx
// OrganizationOverview - Main organization dashboard view

import React from 'react';
import { DepartmentOverview } from './DepartmentOverview';
import { OrganizationPerformance } from './OrganizationPerformance';
import { OrganizationStats } from './OrganizationStats';
import { QuickActions } from './QuickActions';
import { RecentActivity } from './RecentActivity';
import type { LucideIcon } from 'lucide-react';

// ✅ NEW: Proper type definitions
interface OrganizationStats {
  totalProducts?: number;
  lowStockItems?: number;
  pendingTransfers?: number;
  activeUsers?: number;
  totalValue?: string;
  departments?: number;
}

interface Department {
  id: string;
  name: string;
  color?: string;
  icon?: string | LucideIcon | { name?: string; type?: { name?: string } };
  notifications?: number;
  stockItems?: number;
  memberCount?: number;
  lowStock?: number;
}

interface Activity {
  id: number | string;
  type: string;
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
  status: string;
  user: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  stats?: OrganizationStats;
  // Add other organization fields as needed
}

interface OrganizationOverviewProps {
  organization: Organization;
  departments: Department[];
  recentActivities: Activity[];
  onSelectDepartment: (dept: Department) => void;
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