// FILE: components/SettingsManagement/MembersSettings/RoleManager.tsx
// MembersSettings/RoleManager - FIXED with Race Condition Prevention
// ============================================

import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Crown, Shield, UserCircle, Loader2 } from 'lucide-react';
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
  const [pendingRole, setPendingRole] = useState<string | null>(null);

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

  // ✅ FIXED: Prevent concurrent updates
  const handleRoleChange = async (newRole: string) => {
    if (newRole === currentRole) return;
    
    // ✅ ป้องกันการเปลี่ยน role หลายครั้งพร้อมกัน
    if (isUpdating) {
      toast.warning('กำลังอัพเดท role อยู่ กรุณารอสักครู่');
      return;
    }

    setPendingRole(newRole);
    setIsUpdating(true);
    
    try {
      const success = await onRoleUpdate(userId, newRole);
      if (success) {
        toast.success('เปลี่ยนบทบาทสำเร็จ', {
          description: `อัพเดทเป็น ${newRole} แล้ว`
        });
      } else {
        toast.error('ไม่สามารถเปลี่ยนบทบาทได้');
        // Rollback pending role
        setPendingRole(null);
      }
    } catch (error) {
      console.error('Role update error:', error);
      
      // Show specific error message if available
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'เกิดข้อผิดพลาด';
      
      toast.error('ไม่สามารถเปลี่ยนบทบาทได้', {
        description: errorMessage
      });
      
      // Rollback pending role
      setPendingRole(null);
    } finally {
      setIsUpdating(false);
      setPendingRole(null);
    }
  };

  return (
    <div className="relative w-full">
      <Select
        value={pendingRole || currentRole}
        onValueChange={handleRoleChange}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            {isUpdating && <Loader2 className="w-3 h-3 animate-spin" />}
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          {roles.map(role => {
            const Icon = role.icon;
            return (
              <SelectItem 
                key={role.value} 
                value={role.value}
                disabled={isUpdating}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${role.color}`} />
                  <span className="font-medium">{role.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      
      {/* ✅ Loading overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-white/50 rounded flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        </div>
      )}
    </div>
  );
};