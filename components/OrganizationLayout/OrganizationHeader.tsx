// components/OrganizationLayout/OrganizationHeader.tsx
// DashboardHeader - Enhanced Breadcrumb with Reserved Pages and Department Sub-pages Support

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
import { Home, Calendar, Bell, Settings, Users, BarChart3, Package, ArrowRightLeft } from 'lucide-react';
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

// ✅ Reserved org-level pages
const RESERVED_ORG_PAGES = {
  'settings': { label: 'ตั้งค่า', icon: Settings },
  'members': { label: 'จัดการสมาชิก', icon: Users },
  'reports': { label: 'รายงาน', icon: BarChart3 },
  'products': { label: 'สินค้า', icon: Package },
  'transfers': { label: 'โอนย้าย', icon: ArrowRightLeft },
};

// ✅ Department sub-pages
const DEPARTMENT_SUBPAGES = {
  'stocks': { label: 'สต็อกสินค้า', icon: Package },
  'transfers': { label: 'โอนย้าย', icon: ArrowRightLeft },
};

export const DashboardHeader = ({ 
  organization, 
  selectedDepartment 
}: DashboardHeaderProps) => {
  const pathname = usePathname();

  // Parse URL segments: /{orgSlug}/{deptSlug}/{subpage}
  const pathSegments = pathname.split('/').filter(Boolean);
  const currentPageSlug = pathSegments[1]; // Second segment
  const subPageSlug = pathSegments[2]; // Third segment (if exists)
  
  // Check if org-level reserved page
  const isReservedPage = currentPageSlug && RESERVED_ORG_PAGES[currentPageSlug as keyof typeof RESERVED_ORG_PAGES];
  const reservedPageConfig = isReservedPage ? RESERVED_ORG_PAGES[currentPageSlug as keyof typeof RESERVED_ORG_PAGES] : null;

  // Check if department sub-page
  const isDepartmentSubpage = selectedDepartment && subPageSlug && DEPARTMENT_SUBPAGES[subPageSlug as keyof typeof DEPARTMENT_SUBPAGES];
  const subpageConfig = isDepartmentSubpage ? DEPARTMENT_SUBPAGES[subPageSlug as keyof typeof DEPARTMENT_SUBPAGES] : null;

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
                  {isDepartmentSubpage ? (
                    <BreadcrumbLink href={`/${organization.slug}/${selectedDepartment.slug}`}>
                      {selectedDepartment.name}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{selectedDepartment.name}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </>
            )}

            {/* ✅ Department Sub-page (stocks, transfers) */}
            {isDepartmentSubpage && subpageConfig && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="flex items-center gap-2">
                    {subpageConfig.icon && <subpageConfig.icon className="w-4 h-4" />}
                    {subpageConfig.label}
                  </BreadcrumbPage>
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