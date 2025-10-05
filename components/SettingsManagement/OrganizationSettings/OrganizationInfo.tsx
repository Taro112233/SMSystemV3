// FILE: components/SettingsManagement/OrganizationSettings/OrganizationInfo.tsx
// OrganizationSettings/OrganizationInfo - Display current info with Icon & Color
// ============================================

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Mail, Phone, Clock, Building2, FileText, Edit, Palette, ImageIcon } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { getIconComponent, mapColorThemeToTailwind } from '@/lib/department-helpers';

interface OrganizationData {
  name: string;
  slug: string;
  description?: string;
  email?: string;
  phone?: string;
  timezone: string;
  color?: string;  // ✅ NEW
  icon?: string;   // ✅ NEW
}

interface OrganizationInfoProps {
  organization: OrganizationData;
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
  // ✅ Get icon component and color class
  const IconComponent = getIconComponent(organization.icon || 'BUILDING');
  const colorClass = mapColorThemeToTailwind(organization.color || 'BLUE');

  return (
    <div className="space-y-6">
      {/* ✅ NEW: Organization Visual Preview */}
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
        <div className="flex items-center gap-4">
          <div className={`w-20 h-20 ${colorClass} rounded-2xl flex items-center justify-center shadow-lg`}>
            <IconComponent className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {organization.name}
            </h3>
            <p className="text-gray-600 font-mono text-sm">
              {organization.slug}
            </p>
          </div>
        </div>
      </div>

      {/* Basic Information Display */}
      <div className="space-y-4">
        <InfoItem icon={Building2} label="ชื่อองค์กร" value={organization.name} />
        <InfoItem 
          icon={Globe} 
          label="URL Slug" 
          value={organization.slug}
          badge={isOwner ? undefined : "OWNER เท่านั้น"}
        />
        
        {/* ✅ NEW: Display Color & Icon */}
        <InfoItem 
          icon={Palette} 
          label="สีองค์กร" 
          value={
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 ${colorClass} rounded border border-gray-300`} />
              <span>{organization.color || 'BLUE'}</span>
            </div>
          }
        />
        
        <InfoItem 
          icon={ImageIcon} 
          label="ไอคอนองค์กร" 
          value={
            <div className="flex items-center gap-2">
              <IconComponent className="w-5 h-5 text-gray-700" />
              <span>{organization.icon || 'BUILDING'}</span>
            </div>
          }
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

      {/* Edit Button */}
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
interface InfoItemProps {
  icon: LucideIcon;
  label: string;
  value: string | React.ReactNode;
  badge?: string;
}

const InfoItem = ({ 
  icon: Icon, 
  label, 
  value,
  badge 
}: InfoItemProps) => (
  <div className="flex items-start gap-3">
    <Icon className="w-5 h-5 text-gray-600 mt-0.5" />
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">{label}</span>
        {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
      </div>
      <div className="font-medium text-gray-900">
        {typeof value === 'string' ? value : value}
      </div>
    </div>
  </div>
);