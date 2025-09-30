// components/OrganizationLayout/OrganizationHeader.tsx
// DashboardHeader - Breadcrumb navigation bar (FLAT URL STRUCTURE)

import React from 'react';
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
import { Home, Calendar, Bell } from 'lucide-react';

interface DashboardHeaderProps {
  organization: any;
  selectedDepartment?: any;
}

export const DashboardHeader = ({ 
  organization, 
  selectedDepartment 
}: DashboardHeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="flex items-center">
                <Home className="w-4 h-4 mr-1" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            <BreadcrumbSeparator />
            
            <BreadcrumbItem>
              {selectedDepartment ? (
                <BreadcrumbLink href={`/${organization.slug}`}>
                  {organization.name}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{organization.name}</BreadcrumbPage>
              )}
            </BreadcrumbItem>

            {selectedDepartment && (
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