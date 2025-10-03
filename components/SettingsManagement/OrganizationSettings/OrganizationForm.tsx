// FILE: components/SettingsManagement/OrganizationSettings/OrganizationForm.tsx
// OrganizationSettings/OrganizationForm - Edit form with buttons at bottom-right + URL Preview
// ============================================

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, X, Globe, Mail, Phone, Clock, Link2 } from 'lucide-react';

interface OrganizationFormProps {
  organization: {
    name: string;
    slug: string;
    description?: string;
    email?: string;
    phone?: string;
    timezone: string;
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
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  // ✅ Generate example URL from slug
  const getExampleUrl = () => {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'http://localhost:3000';
    return `${baseUrl}/${formData.slug}`;
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

      {/* Slug with URL Preview */}
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
        
        {/* ✅ URL Preview - แสดงตัวอย่าง URL จริง */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Link2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-blue-900 mb-1">
              ตัวอย่าง URL ขององค์กร:
            </div>
            <div className="text-sm font-mono text-blue-700 break-all">
              {getExampleUrl()}
            </div>
          </div>
        </div>
        
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

      {/* Action Buttons - BOTTOM RIGHT */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          <X className="w-4 h-4 mr-2" />
          ยกเลิก
        </Button>
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
      </div>
    </form>
  );
};