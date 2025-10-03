// FILE: components/SettingsManagement/index.tsx
// SettingsManagement - Main settings router/tabs with organizationSlug
// ============================================

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, UserCog } from 'lucide-react';

import { OrganizationSettings } from './OrganizationSettings';
import { DepartmentSettings } from './DepartmentSettings';
import { MembersSettings } from './MembersSettings';

interface SettingsManagementProps {
  organization: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    email?: string;
    phone?: string;
    timezone: string;
    inviteCode?: string;
    inviteEnabled?: boolean;
    status: string;
  };
  departments: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string;
    color?: string;
    icon?: string;
    isActive: boolean;
    parentId?: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  userRole: 'MEMBER' | 'ADMIN' | 'OWNER';
  isLoadingDepartments?: boolean;
  onOrganizationUpdate: (data: any) => Promise<any>;
  onDepartmentCreate: (data: any) => Promise<void>;
  onDepartmentUpdate: (deptId: string, data: any) => Promise<void>;
  onDepartmentDelete: (deptId: string) => Promise<void>;
}

export const SettingsManagement = ({
  organization,
  departments,
  userRole,
  isLoadingDepartments = false,
  onOrganizationUpdate,
  onDepartmentCreate,
  onDepartmentUpdate,
  onDepartmentDelete,
}: SettingsManagementProps) => {
  return (
    <Tabs defaultValue="organization" className="w-full">
      <TabsList className="grid w-full md:w-auto grid-cols-3 mb-6">
        <TabsTrigger value="organization" className="flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          <span>ข้อมูลองค์กร</span>
        </TabsTrigger>
        <TabsTrigger value="departments" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>จัดการหน่วยงาน</span>
        </TabsTrigger>
        <TabsTrigger value="members" className="flex items-center gap-2">
          <UserCog className="w-4 h-4" />
          <span>จัดการสมาชิก</span>
        </TabsTrigger>
      </TabsList>

      {/* Organization Settings Tab */}
      <TabsContent value="organization" className="space-y-6">
        <OrganizationSettings
          organization={organization}
          userRole={userRole}
          onUpdate={onOrganizationUpdate}
        />
      </TabsContent>

      {/* Department Management Tab - ✅ Pass organizationSlug */}
      <TabsContent value="departments" className="space-y-6">
        <DepartmentSettings
          departments={departments}
          organizationId={organization.id}
          organizationSlug={organization.slug}
          userRole={userRole}
          isLoading={isLoadingDepartments}
          onCreate={onDepartmentCreate}
          onUpdate={onDepartmentUpdate}
          onDelete={onDepartmentDelete}
        />
      </TabsContent>

      {/* Members Management Tab */}
      <TabsContent value="members" className="space-y-6">
        <MembersSettings
          organizationId={organization.id}
          organizationSlug={organization.slug}
          userRole={userRole}
        />
      </TabsContent>
    </Tabs>
  );
};