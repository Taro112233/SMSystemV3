// components/OrganizationLayout/SidebarHeader.tsx
// DashboardSidebar/SidebarHeader - Organization header with collapse toggle

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  color: string;
  userRole: string;
}

interface SidebarHeaderProps {
  organization: OrganizationData;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const SidebarHeader = ({ 
  organization, 
  collapsed, 
  onToggleCollapse 
}: SidebarHeaderProps) => {
  return (
    <div className="p-4 border-b border-gray-200">
      {!collapsed ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${organization.color} rounded-lg flex items-center justify-center text-white font-bold`}>
              {organization.logo}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-gray-900 text-sm leading-tight truncate">
                {organization.name}
              </h2>
              <p className="text-xs text-gray-500 truncate">{organization.userRole}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onToggleCollapse}
            className="h-10 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="flex justify-center">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onToggleCollapse}
            className="h-10 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};