// FILE: components/SettingsManagement/MembersSettings/RoleManager.tsx
// MembersSettings/RoleManager - Role dropdown/assignment
// ============================================

import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface RoleManagerProps {
  currentRole: 'MEMBER' | 'ADMIN' | 'OWNER';
  userId: string;
  onRoleUpdate: (userId: string, newRole: string) => Promise<boolean>;
}

export const RoleManager = ({
  currentRole,
  userId,
  onRoleUpdate
}: RoleManagerProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const roles = [
    { value: 'MEMBER', label: 'สมาชิก' },
    { value: 'ADMIN', label: 'ผู้ดูแล' },
    { value: 'OWNER', label: 'เจ้าของ' }
  ];

  const handleRoleChange = async (newRole: string) => {
    if (newRole === currentRole) return;

    setIsUpdating(true);
    try {
      const success = await onRoleUpdate(userId, newRole);
      if (success) {
        toast.success('เปลี่ยนบทบาทสำเร็จ');
      } else {
        toast.error('ไม่สามารถเปลี่ยนบทบาทได้');
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select
      value={currentRole}
      onValueChange={handleRoleChange}
      disabled={isUpdating}
    >
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {roles.map(role => (
          <SelectItem key={role.value} value={role.value}>
            {role.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};