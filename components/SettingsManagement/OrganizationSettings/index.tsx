// FILE: components/SettingsManagement/OrganizationSettings/index.tsx
// OrganizationSettings - Container (NO CHANGES NEEDED)
// ============================================

import React, { useState } from 'react';
import { toast } from 'sonner';
import { OrganizationInfo } from './OrganizationInfo';
import { OrganizationForm } from './OrganizationForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';
import { SettingsSection } from '../shared/SettingsSection';

// ✅ FIXED: Proper type definitions
interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  email?: string;
  phone?: string;
  timezone: string;
  status: string;
}

interface OrganizationUpdateData {
  name?: string;
  slug?: string;
  description?: string;
  email?: string;
  phone?: string;
  timezone?: string;
  inviteCode?: string;
  inviteEnabled?: boolean;
}

interface OrganizationSettingsProps {
  organization: Organization;
  userRole: 'MEMBER' | 'ADMIN' | 'OWNER';
  onUpdate: (data: OrganizationUpdateData) => Promise<Organization>;
}

export const OrganizationSettings = ({ 
  organization, 
  userRole, 
  onUpdate 
}: OrganizationSettingsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const canEdit = ['ADMIN', 'OWNER'].includes(userRole);
  const isOwner = userRole === 'OWNER';

  const handleEdit = () => {
    if (!canEdit) {
      toast.error('คุณไม่มีสิทธิ์แก้ไขข้อมูล');
      return;
    }
    setIsEditing(true);
  };

  const handleSave = async (formData: OrganizationUpdateData) => {
    try {
      await onUpdate(formData);
      setIsEditing(false);
      toast.success('บันทึกการเปลี่ยนแปลงสำเร็จ');
    } catch (error) {
      console.error('Update failed:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Permission Alert */}
      {!canEdit && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            คุณมีสิทธิ์ดูข้อมูลเท่านั้น ต้องเป็น ADMIN หรือ OWNER จึงจะแก้ไขได้
          </AlertDescription>
        </Alert>
      )}

      <SettingsSection
        title="ข้อมูลพื้นฐาน"
        description="ข้อมูลหลักขององค์กร"
      >
        {!isEditing ? (
          <OrganizationInfo
            organization={organization}
            canEdit={canEdit}
            isOwner={isOwner}
            onEdit={handleEdit}
          />
        ) : (
          <OrganizationForm
            organization={organization}
            isOwner={isOwner}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </SettingsSection>
    </div>
  );
};