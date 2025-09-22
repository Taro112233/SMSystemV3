// app/org/[orgSlug]/components/DashboardSidebar/SidebarNavigation.tsx
// DashboardSidebar/SidebarNavigation - Main navigation menu and search

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ArrowLeft, Home, BarChart3, Settings } from 'lucide-react';

interface SidebarNavigationProps {
  collapsed: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const SidebarNavigation = ({ 
  collapsed, 
  searchTerm, 
  onSearchChange 
}: SidebarNavigationProps) => {
  return (
    <>
      {!collapsed && (
        <>
          {/* Back to Organizations */}
          <Button 
            variant="ghost" 
            className="w-full justify-start mb-4 text-sm h-9"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับไปเลือกองค์กร
          </Button>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input 
              placeholder="ค้นหาแผนก..." 
              className="pl-10 h-8 text-sm bg-gray-50 border-0"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </>
      )}

      {/* Main Navigation */}
      <div className="space-y-1">
        {!collapsed && (
          <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            หน้าหลัก
          </div>
        )}
        
        <Button 
          variant="secondary" 
          className={`${collapsed ? 'w-full justify-center' : 'w-full justify-start'} h-9`}
        >
          <Home className="w-4 h-4" />
          {!collapsed && <span className="ml-2">ภาพรวมองค์กร</span>}
        </Button>
        
        <Button 
          variant="ghost" 
          className={`${collapsed ? 'w-full justify-center' : 'w-full justify-start'} h-9`}
        >
          <BarChart3 className="w-4 h-4" />
          {!collapsed && <span className="ml-2">รายงาน</span>}
        </Button>
        
        <Button 
          variant="ghost" 
          className={`${collapsed ? 'w-full justify-center' : 'w-full justify-start'} h-9`}
        >
          <Settings className="w-4 h-4" />
          {!collapsed && <span className="ml-2">ตั้งค่า</span>}
        </Button>
      </div>
    </>
  );
};