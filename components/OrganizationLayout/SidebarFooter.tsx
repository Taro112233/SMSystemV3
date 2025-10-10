// components/OrganizationLayout/SidebarFooter.tsx
// DashboardSidebar/SidebarFooter - UPDATED: Display real user data with working logout

import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
}

interface SidebarFooterProps {
  collapsed: boolean;
  user?: User | null;
  userRole?: string | null;
  onLogout?: () => Promise<void>;
}

export const SidebarFooter = ({ collapsed, user, userRole, onLogout }: SidebarFooterProps) => {

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  // Get role display text in Thai
  const getRoleDisplay = () => {
    if (!userRole) return 'สมาชิก';

    const roleMap: Record<string, string> = {
      OWNER: 'เจ้าขององค์กร',
      ADMIN: 'ผู้ดูแลระบบ',
      MEMBER: 'สมาชิก'
    };

    return roleMap[userRole] || 'สมาชิก';
  };

  // Handle logout (same logic as DashboardHeader)
  const handleLogout = async () => {
    if (onLogout) {
      try {
        await onLogout();
        // Navigate to login page after successful logout
        window.location.href = '/login';
      } catch (error) {
        console.error('Logout error:', error);
        // Still redirect to login even if logout fails (for better UX)
        window.location.href = '/login';
      }
    } else {
      // If no onLogout function provided, just redirect
      window.location.href = '/login';
    }
  };

  // Collapsed view - show avatar only
  if (collapsed) {
    return (
      <div className="p-3 border-t border-gray-200">
        <div className="flex justify-center">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    );
  }

  // Full view - show user info and logout button
  return (
    <div className="p-3 border-t border-gray-200">
      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {user ? `${user.firstName} ${user.lastName}` : 'ผู้ใช้'}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {getRoleDisplay()}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-red-100 hover:text-red-600 transition-colors"
          onClick={handleLogout}
          title="ออกจากระบบ"
        >
          <LogOut className="w-4 h-4" />
        </Button>

      </div>
    </div>
  );
};