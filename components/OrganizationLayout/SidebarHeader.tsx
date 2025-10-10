// FILE: components/OrganizationLayout/SidebarHeader.tsx
// DashboardSidebar/SidebarHeader - FIXED to properly display Icon & Color
// ============================================

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronsLeft, Menu } from 'lucide-react';
import { getIconComponent, mapColorThemeToTailwind } from '@/lib/department-helpers';

interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo?: string;         // Keep for backward compatibility
  color: string;         // ✅ ColorTheme enum value (required)
  icon: string;          // ✅ IconType enum value (required)
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
  // ✅ DEBUG: Log values to verify they're received correctly
  console.log('🎨 SidebarHeader - Received:', {
    name: organization.name,
    color: organization.color,
    icon: organization.icon,
    colorType: typeof organization.color,
    iconType: typeof organization.icon
  });

  // ✅ Get icon component from enum value
  const IconComponent = getIconComponent(organization.icon);
  
  // ✅ Get color class from enum value
  const colorClass = mapColorThemeToTailwind(organization.color);

  // ✅ DEBUG: Log transformed values
  console.log('🎨 SidebarHeader - Transformed:', {
    colorClass,
    IconComponent: IconComponent.name
  });

  return (
    <div className="p-4 border-b border-gray-200">
      {!collapsed ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* ✅ Display icon with color from database */}
            <div className={`w-10 h-10 ${colorClass} rounded-lg flex items-center justify-center shadow-sm`}>
              <IconComponent className="w-5 h-5 text-white" />
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
            className="h-10 w-10"
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          {/* ✅ Collapsed state - show ChevronRight */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onToggleCollapse}
            className="h-10 w-10"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};