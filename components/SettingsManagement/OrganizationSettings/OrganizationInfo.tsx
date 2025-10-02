// FILE: components/SettingsManagement/OrganizationSettings/OrganizationInfo.tsx
// OrganizationSettings/OrganizationInfo - Display current info (NO INVITE CODE)
// ============================================

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Mail, Phone, Clock, Building2, FileText, Edit } from 'lucide-react';

interface OrganizationInfoProps {
  organization: {
    name: string;
    slug: string;
    description?: string;
    email?: string;
    phone?: string;
    timezone: string;
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

      {/* Edit Button - ขวาล่าง */}
      {canEdit && (
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
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