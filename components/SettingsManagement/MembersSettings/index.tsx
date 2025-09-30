// FILE: components/SettingsManagement/MembersSettings/index.tsx
// MembersSettings - Container + state management
// ============================================

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';
import { MembersList } from './MembersList';
import { SettingsSection } from '../shared/SettingsSection';
import { InviteCodeSection } from './InviteCodeSection';

interface MembersSettingsProps {
  organizationId: string;
  organizationSlug: string;
  userRole: 'MEMBER' | 'ADMIN' | 'OWNER';
}

export const MembersSettings = ({
  organizationId,
  organizationSlug,
  userRole
}: MembersSettingsProps) => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const canManage = ['ADMIN', 'OWNER'].includes(userRole);

  useEffect(() => {
    if (canManage) {
      loadMembers();
    }
  }, [canManage, organizationSlug]);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/${organizationSlug}/members`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: string) => {
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
      }
      return false;
    } catch (error) {
      console.error('Failed to update role:', error);
      return false;
    }
  };

  const handleMemberRemove = async (userId: string) => {
    try {
      const response = await fetch(`/api/${organizationSlug}/members/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await loadMembers();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to remove member:', error);
      return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Permission Alert */}
      {!canManage && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            คุณไม่มีสิทธิ์จัดการสมาชิก ต้องเป็น ADMIN หรือ OWNER เท่านั้น
          </AlertDescription>
        </Alert>
      )}

      {canManage && (
        <>
          {/* Invite Code Section */}
          <SettingsSection
            title="รหัสเชิญเข้าองค์กร"
            description="สร้างและจัดการรหัสเชิญสำหรับสมาชิกใหม่"
          >
            <InviteCodeSection
              organizationSlug={organizationSlug}
              userRole={userRole}
            />
          </SettingsSection>

          {/* Members List */}
          <SettingsSection
            title="สมาชิกในองค์กร"
            description="จัดการสมาชิก บทบาท และสิทธิ์การเข้าถึง"
          >
            <MembersList
              members={members}
              isLoading={isLoading}
              currentUserRole={userRole}
              onRoleUpdate={handleRoleUpdate}
              onMemberRemove={handleMemberRemove}
            />
          </SettingsSection>
        </>
      )}
    </div>
  );
};