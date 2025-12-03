// components/OrganizationLayout/SidebarNavigation.tsx
// ✅ FIXED: Use startsWith for path matching

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Home, Settings, ArrowRightLeft } from 'lucide-react';
import { useRouter, useParams, usePathname } from 'next/navigation';

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
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const orgSlug = params.orgSlug as string;

  // ✅ FIXED: Use startsWith for better path matching
  const isOverviewActive = pathname === `/${orgSlug}` || pathname === `/${orgSlug}/`;
  const isTransfersActive = pathname.startsWith(`/${orgSlug}/transfers`);
  const isSettingsActive = pathname.startsWith(`/${orgSlug}/settings`);

  const handleOverviewClick = () => {
    router.push(`/${orgSlug}`);
  };

  const handleTransfersClick = () => {
    router.push(`/${orgSlug}/transfers`);
  };

  const handleSettingsClick = () => {
    router.push(`/${orgSlug}/settings`);
  };

  return (
    <>
      {!collapsed && (
        <>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input 
              placeholder="ค้นหาหน่วยงาน..." 
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
          variant={isOverviewActive ? "secondary" : "ghost"}
          className={`${collapsed ? 'w-full justify-center' : 'w-full justify-start'} h-9`}
          onClick={handleOverviewClick}
        >
          <Home className="w-4 h-4" />
          {!collapsed && <span className="ml-2">ภาพรวมองค์กร</span>}
        </Button>
        
        <Button 
          variant={isTransfersActive ? "secondary" : "ghost"}
          className={`${collapsed ? 'w-full justify-center' : 'w-full justify-start'} h-9`}
          onClick={handleTransfersClick}
        >
          <ArrowRightLeft className="w-4 h-4" />
          {!collapsed && <span className="ml-2">การเบิกจ่าย</span>}
        </Button>
        
        <Button 
          variant={isSettingsActive ? "secondary" : "ghost"}
          className={`${collapsed ? 'w-full justify-center' : 'w-full justify-start'} h-9`}
          onClick={handleSettingsClick}
        >
          <Settings className="w-4 h-4" />
          {!collapsed && <span className="ml-2">ตั้งค่า</span>}
        </Button>
      </div>
    </>
  );
};