// components/OrganizationLayout/SidebarFooter.tsx
// DashboardSidebar/SidebarFooter - User profile section with logout

import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';

interface SidebarFooterProps {
  collapsed: boolean;
}

export const SidebarFooter = ({ collapsed }: SidebarFooterProps) => {
  const handleLogout = () => {
    // TODO: Implement logout functionality
    console.log('Logout clicked');
  };

  if (collapsed) {
    return (
      <div className="p-3 border-t border-gray-200">
        <div className="flex justify-center">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">AI</AvatarFallback>
          </Avatar>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 border-t border-gray-200">
      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">AI</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">Ai Satang</div>
          <div className="text-xs text-gray-500">เจ้าขององค์กร</div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6"
          onClick={handleLogout}
          title="ออกจากระบบ"
        >
          <LogOut className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};