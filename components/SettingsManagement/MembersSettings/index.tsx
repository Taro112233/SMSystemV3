// FILE: components/SettingsManagement/MembersSettings/index.tsx
// MembersSettings - Container + state management - FIXED: Remove unused imports
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react'; // ✅ FIXED: Removed unused 'Lock' import
import { MembersList } from './MembersList';
import { SettingsSection } from '../shared/SettingsSection';
import { InviteCodeSection } from './InviteCodeSection';
import { toast } from 'sonner';

interface Member {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  role: 'MEMBER' | 'ADMIN' | 'OWNER';
  joinedAt: Date;
}

interface MembersSettingsProps {
  organizationId: string;
  organizationSlug: string;
  userRole: 'MEMBER' | 'ADMIN' | 'OWNER';
}

export const MembersSettings = ({
  organizationSlug,
  userRole
}: MembersSettingsProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // ✅ FIXED: Removed unused 'canView' variable
  const canManage = ['ADMIN', 'OWNER'].includes(userRole);

  const loadMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/${organizationSlug}/members`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load members');
      }
    } catch (error) {
      console.error('Failed to load members:', error);
      toast.error('ไม่สามารถโหลดข้อมูลสมาชิกได้', {
        description: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
      });
    } finally {
      setIsLoading(false);
    }
  }, [organizationSlug]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleRoleUpdate = async (userId: string, newRole: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/${organizationSlug}/members/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        await loadMembers();
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update role');
      }
    } catch (error) {
      console.error('Failed to update role:', error);
      throw error;
    }
  };

  const handleMemberRemove = async (userId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/${organizationSlug}/members/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await loadMembers();
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Info alert for MEMBER (not blocking) */}
      {!canManage && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            คุณสามารถดูรายชื่อสมาชิกได้ แต่ไม่สามารถแก้ไขหรือลบได้ (ต้องเป็น ADMIN หรือ OWNER)
          </AlertDescription>
        </Alert>
      )}

      {/* Show Invite Code Section only for ADMIN/OWNER */}
      {canManage && (
        <SettingsSection
          title="รหัสเชิญเข้าองค์กร"
          description="สร้างและจัดการรหัสเชิญสำหรับสมาชิกใหม่"
        >
          <InviteCodeSection
            organizationSlug={organizationSlug}
            userRole={userRole}
          />
        </SettingsSection>
      )}

      {/* Show Members List for everyone */}
      <SettingsSection
        title="สมาชิกในองค์กร"
        description={
          canManage 
            ? "จัดการสมาชิก บทบาท และสิทธิ์การเข้าถึง"
            : "รายชื่อสมาชิกทั้งหมดในองค์กร"
        }
      >
        <MembersList
          members={members}
          isLoading={isLoading}
          currentUserRole={userRole}
          onRoleUpdate={handleRoleUpdate}
          onMemberRemove={handleMemberRemove}
        />
      </SettingsSection>
    </div>
  );
};