// FILE: components/OrganizationList/DashboardHeader.tsx - UPDATED
// DashboardHeader - Updated header with correct settings path
// ============================================

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building2, Bell, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Organization {
  notifications: number;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
}

interface DashboardHeaderProps {
  organizations: Organization[];
  user?: User | null;
  onRefresh?: () => void;
  onLogout?: () => Promise<void>;
}

export const DashboardHeader = ({
  organizations,
  user,
  onLogout
}: DashboardHeaderProps) => {
  const router = useRouter();
  const totalNotifications = organizations.reduce((sum, org) => sum + org.notifications, 0);

  const handleLogout = async () => {
    if (onLogout) {
      try {
        await onLogout();
        window.location.href = '/login';
      } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/login';
      }
    } else {
      window.location.href = '/login';
    }
  };

  // ✅ UPDATED: Navigate to /dashboard/settings/profile
  const handleSettings = () => {
    router.push('/dashboard/settings/profile');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/dashboard')}>
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">InvenStock</h1>
              <p className="text-xs text-gray-600">Multi-Tenant Inventory System</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button variant="outline" size="icon" className="relative">
              <Bell className="w-4 h-4" />
              {totalNotifications > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {totalNotifications > 99 ? '99+' : totalNotifications}
                </Badge>
              )}
            </Button>

            {/* Settings */}
            <Button variant="outline" size="icon" onClick={handleSettings}>
              <Settings className="w-4 h-4" />
            </Button>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">
                  {user ? user.fullName : 'ผู้ใช้'}
                </p>
                <p className="text-xs text-gray-500">{organizations.length} องค์กร</p>
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
        </div>
      </div>
    </header>
  );
};