// FILE: components/SettingsManagement/MembersSettings/RoleManager.tsx
// MembersSettings/RoleManager - UPDATED to show actual role names
// ============================================

import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Crown, Shield, UserCircle } from 'lucide-react';
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

  // ✅ UPDATED: แสดง role จริง พร้อมไอคอน
  const roles = [
    { 
      value: 'MEMBER', 
      label: 'MEMBER',
      icon: UserCircle,
      color: 'text-gray-600'
    },
    { 
      value: 'ADMIN', 
      label: 'ADMIN',
      icon: Shield,
      color: 'text-blue-600'
    },
    { 
      value: 'OWNER', 
      label: 'OWNER',
      icon: Crown,
      color: 'text-purple-600'
    }
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
        {roles.map(role => {
          const Icon = role.icon;
          return (
            <SelectItem key={role.value} value={role.value}>
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${role.color}`} />
                <span className="font-medium">{role.label}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};