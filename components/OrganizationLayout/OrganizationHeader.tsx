// components/OrganizationLayout/OrganizationHeader.tsx
// DashboardHeader - Enhanced Breadcrumb with Reserved Pages Support

import React from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home, Calendar, Bell, Settings, Users, BarChart3 } from 'lucide-react';
import type { FrontendDepartment } from '@/lib/department-helpers';

interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  color: string;
  userRole: string;
}

interface DashboardHeaderProps {
  organization: OrganizationData;
  selectedDepartment?: FrontendDepartment | null;
}

// ✅ Reserved org-level pages (from middleware.ts)
const RESERVED_ORG_PAGES = {
  'settings': { label: 'ตั้งค่า', icon: Settings },
  'members': { label: 'จัดการสมาชิก', icon: Users },
  'reports': { label: 'รายงาน', icon: BarChart3 },
  'products': { label: 'สินค้า', icon: null },
  'transfers': { label: 'โอนย้าย', icon: null },
};

export const DashboardHeader = ({ 
  organization, 
  selectedDepartment 
}: DashboardHeaderProps) => {
  const pathname = usePathname();

  // ✅ Detect if current page is a reserved org page
  const pathSegments = pathname.split('/').filter(Boolean);
  const currentPageSlug = pathSegments[1]; // Second segment: /{orgSlug}/{pageSlug}
  
  const isReservedPage = currentPageSlug && RESERVED_ORG_PAGES[currentPageSlug as keyof typeof RESERVED_ORG_PAGES];
  const reservedPageConfig = isReservedPage ? RESERVED_ORG_PAGES[currentPageSlug as keyof typeof RESERVED_ORG_PAGES] : null;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        {/* ✅ Enhanced Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            {/* Home */}
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="flex items-center">
                <Home className="w-4 h-4 mr-1" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            <BreadcrumbSeparator />
            
            {/* Organization */}
            <BreadcrumbItem>
              {(selectedDepartment || isReservedPage) ? (
                <BreadcrumbLink href={`/${organization.slug}`}>
                  {organization.name}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{organization.name}</BreadcrumbPage>
              )}
            </BreadcrumbItem>

            {/* ✅ Reserved Org Page (settings, members, reports) */}
            {isReservedPage && reservedPageConfig && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="flex items-center gap-2">
                    {reservedPageConfig.icon && <reservedPageConfig.icon className="w-4 h-4" />}
                    {reservedPageConfig.label}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}

            {/* ✅ Department (only if not reserved page) */}
            {!isReservedPage && selectedDepartment && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{selectedDepartment.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        
        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            วันนี้
          </Button>
          <Button variant="outline" size="icon">
            <Bell className="w-4 h-4" />
          </Button>
          <Avatar>
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};