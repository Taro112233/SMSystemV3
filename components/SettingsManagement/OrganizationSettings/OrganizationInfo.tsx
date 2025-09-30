// FILE: components/SettingsManagement/OrganizationSettings/OrganizationInfo.tsx
// OrganizationSettings/OrganizationInfo - Display current info (FIXED)
// ============================================

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  CheckCircle2, 
  RefreshCw, 
  Globe, 
  Mail, 
  Phone, 
  Clock, 
  Key,
  Building2,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface OrganizationInfoProps {
  organization: {
    name: string;
    slug: string;
    description?: string;
    email?: string;
    phone?: string;
    timezone: string;
    inviteCode?: string;
    inviteEnabled?: boolean;
  };
  canEdit: boolean;
  isOwner: boolean;
  onEdit: () => void;
}

export const OrganizationInfo = ({
  organization,
  canEdit,
  isOwner,
  onEdit
}: OrganizationInfoProps) => {
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyInviteCode = () => {
    if (organization.inviteCode) {
      navigator.clipboard.writeText(organization.inviteCode);
      setCopiedCode(true);
      toast.success('คัดลอกรหัสเชิญสำเร็จ');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleGenerateNewCode = async () => {
    if (!isOwner) {
      toast.error('เฉพาะ OWNER เท่านั้นที่สามารถสร้างรหัสเชิญใหม่ได้');
      return;
    }

    try {
      const response = await fetch(`/api/${organization.slug}/settings/generate-invite-code`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to generate invite code');
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('สร้างรหัสเชิญใหม่สำเร็จ', {
          description: `รหัสใหม่: ${data.inviteCode}`
        });
        window.location.reload();
      }
    } catch (error) {
      toast.error('ไม่สามารถสร้างรหัสเชิญใหม่ได้');
      console.error('Generate invite code failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information Display */}
      <div className="space-y-4">
        <InfoItem icon={Building2} label="ชื่อองค์กร" value={organization.name} />
        <InfoItem 
          icon={Globe} 
          label="URL Slug" 
          value={organization.slug}
          badge={isOwner ? undefined : "OWNER เท่านั้น"}
        />
        <InfoItem 
          icon={FileText} 
          label="คำอธิบาย" 
          value={organization.description || 'ไม่มีคำอธิบาย'} 
        />
        <InfoItem icon={Mail} label="อีเมล" value={organization.email || '-'} />
        <InfoItem icon={Phone} label="เบอร์โทรศัพท์" value={organization.phone || '-'} />
        <InfoItem icon={Clock} label="เขตเวลา" value={organization.timezone} />
      </div>

      {/* Invite Code Section */}
      {organization.inviteCode && (
        <div className="pt-6 border-t space-y-4">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-gray-600" />
            <span className="font-medium">รหัสเชิญเข้าองค์กร</span>
            {organization.inviteEnabled ? (
              <Badge variant="default">เปิดใช้งาน</Badge>
            ) : (
              <Badge variant="secondary">ปิดใช้งาน</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <code className="flex-1 px-4 py-2 bg-gray-100 rounded-lg font-mono text-sm">
              {organization.inviteCode}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyInviteCode}
            >
              {copiedCode ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateNewCode}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Edit Button */}
      {canEdit && (
        <div className="pt-4">
          <Button onClick={onEdit}>
            แก้ไขข้อมูล
          </Button>
        </div>
      )}
    </div>
  );
};

// Helper component for displaying info items
const InfoItem = ({ 
  icon: Icon, 
  label, 
  value,
  badge 
}: { 
  icon: any; 
  label: string; 
  value: string;
  badge?: string;
}) => (
  <div className="flex items-start gap-3">
    <Icon className="w-5 h-5 text-gray-600 mt-0.5" />
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">{label}</span>
        {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
      </div>
      <div className="font-medium text-gray-900">{value}</div>
    </div>
  </div>
);