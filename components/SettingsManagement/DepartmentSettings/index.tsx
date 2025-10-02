// FILE: components/SettingsManagement/DepartmentSettings/index.tsx
// DepartmentSettings - Container + state management
// ============================================

import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { DepartmentList } from './DepartmentList';

interface DepartmentSettingsProps {
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
  organizationId: string;
  userRole: 'MEMBER' | 'ADMIN' | 'OWNER';
  onCreate: (data: any) => Promise<void>;
  onUpdate: (deptId: string, data: any) => Promise<void>;
  onDelete: (deptId: string) => Promise<void>;
}

export const DepartmentSettings = ({
  departments,
  organizationId,
  userRole,
  onCreate,
  onUpdate,
  onDelete
}: DepartmentSettingsProps) => {
  const canManage = ['ADMIN', 'OWNER'].includes(userRole);

  return (
    <div className="space-y-6">
      {/* Permission Alert */}
      {!canManage && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            คุณไม่มีสิทธิ์จัดการหน่วยงาน ต้องเป็น ADMIN หรือ OWNER เท่านั้น
          </AlertDescription>
        </Alert>
      )}

      {/* Department List */}
      <DepartmentList
        departments={departments}
        organizationId={organizationId}
        canManage={canManage}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </div>
  );
};