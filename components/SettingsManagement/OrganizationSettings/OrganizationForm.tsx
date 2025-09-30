// FILE: components/SettingsManagement/OrganizationSettings/OrganizationForm.tsx
// OrganizationSettings/OrganizationForm - Edit organization form
// ============================================

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save, X, Globe, Mail, Phone, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface OrganizationFormProps {
  organization: {
    name: string;
    slug: string;
    description?: string;
    email?: string;
    phone?: string;
    timezone: string;
    inviteEnabled?: boolean;
  };
  isOwner: boolean;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

export const OrganizationForm = ({
  organization,
  isOwner,
  onSave,
  onCancel
}: OrganizationFormProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: organization.name,
    slug: organization.slug,
    description: organization.description || '',
    email: organization.email || '',
    phone: organization.phone || '',
    timezone: organization.timezone,
    inviteEnabled: organization.inviteEnabled ?? true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, inviteEnabled: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Organization Name */}
      <div className="space-y-2">
        <Label htmlFor="name">ชื่อองค์กร *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </div>

      {/* Slug */}
      <div className="space-y-2">
        <Label htmlFor="slug" className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          URL Slug *
        </Label>
        <Input
          id="slug"
          name="slug"
          value={formData.slug}
          onChange={handleInputChange}
          disabled={!isOwner}
          placeholder="organization-name"
          pattern="[a-z0-9-]+"
          required
        />
        <p className="text-xs text-gray-500">
          ใช้ตัวอักษรพิมพ์เล็ก ตัวเลข และเครื่องหมาย - เท่านั้น
        </p>
        {!isOwner && (
          <p className="text-xs text-orange-600">
            เฉพาะ OWNER เท่านั้นที่แก้ไข URL Slug ได้
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">คำอธิบาย</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          placeholder="อธิบายเกี่ยวกับองค์กรของคุณ..."
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          อีเมลองค์กร
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="contact@organization.com"
        />
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          เบอร์โทรศัพท์
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="02-xxx-xxxx"
        />
      </div>

      {/* Timezone */}
      <div className="space-y-2">
        <Label htmlFor="timezone" className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          เขตเวลา
        </Label>
        <Input
          id="timezone"
          name="timezone"
          value={formData.timezone}
          onChange={handleInputChange}
        />
      </div>

      {/* Invite Enabled */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="space-y-1">
          <div className="font-medium">เปิดใช้งานรหัสเชิญ</div>
          <div className="text-sm text-gray-600">
            อนุญาตให้สมาชิกใหม่เข้าร่วมผ่านรหัสเชิญ
          </div>
        </div>
        <Switch
          checked={formData.inviteEnabled}
          onCheckedChange={handleSwitchChange}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t">
        <Button
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Save className="w-4 h-4 mr-2 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              บันทึกการเปลี่ยนแปลง
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          <X className="w-4 h-4 mr-2" />
          ยกเลิก
        </Button>
      </div>
    </form>
  );
};