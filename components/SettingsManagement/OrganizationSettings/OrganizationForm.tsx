// components/SettingsManagement/OrganizationSettings/OrganizationForm.tsx
// OrganizationSettings/OrganizationForm - UPDATED with slug validation
// ============================================

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, X, Globe, Mail, Phone, Clock, Link2, AlertTriangle } from 'lucide-react';
import { getAvailableColors, getAvailableIcons, getIconComponent } from '@/lib/department-helpers';
import { validateOrgSlug } from '@/lib/slug-validator';

interface OrganizationData {
  name: string;
  slug: string;
  description?: string;
  email?: string;
  phone?: string;
  timezone: string;
  color?: string;
  icon?: string;
}

interface OrganizationFormProps {
  organization: OrganizationData;
  isOwner: boolean;
  onSave: (data: OrganizationData) => Promise<void>;
  onCancel: () => void;
}

export const OrganizationForm = ({
  organization,
  isOwner,
  onSave,
  onCancel
}: OrganizationFormProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [slugError, setSlugError] = useState('');
  const [formData, setFormData] = useState<OrganizationData>({
    name: organization.name,
    slug: organization.slug,
    description: organization.description || '',
    email: organization.email || '',
    phone: organization.phone || '',
    timezone: organization.timezone,
    color: organization.color || 'BLUE',
    icon: organization.icon || 'BUILDING',
  });

  const colors = getAvailableColors();
  const icons = getAvailableIcons();

  const selectedColor = colors.find(c => c.value === formData.color);
  const SelectedIcon = getIconComponent(formData.icon || 'BUILDING');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'slug' && isOwner) {
      const validation = validateOrgSlug(value);
      if (!validation.isValid) {
        setSlugError(validation.error || 'Slug ไม่ถูกต้อง');
      } else {
        setSlugError('');
      }
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isOwner && formData.slug !== organization.slug) {
      const slugValidation = validateOrgSlug(formData.slug);
      if (!slugValidation.isValid) {
        setSlugError(slugValidation.error || 'Slug ไม่ถูกต้อง');
        return;
      }
    }

    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getExampleUrl = () => {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'http://localhost:3000';
    return `${baseUrl}/${formData.slug}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Organization Preview Card */}
      <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-sm text-gray-600 mb-2">ตัวอย่าง:</div>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${selectedColor?.class || 'bg-blue-500'} rounded-xl flex items-center justify-center`}>
            <SelectedIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-lg">
              {formData.name || 'ชื่อองค์กร'}
            </div>
            <div className="text-sm text-gray-500 font-mono">
              {formData.slug || 'slug'}
            </div>
          </div>
        </div>
      </div>

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

      {/* Slug with URL Preview and Validation */}
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
          className={slugError ? 'border-red-500' : ''}
        />
        
        {/* ✅ FIXED: Removed X icon from circle, show only triangle icon with text */}
        {slugError && isOwner && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-600" />
            <p className="text-xs text-red-700 flex-1">{slugError}</p>
          </div>
        )}
        
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
      </div>

      {/* Color & Icon Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="color">สีองค์กร</Label>
          <Select
            value={formData.color}
            onValueChange={(value) => handleSelectChange('color', value)}
          >
            <SelectTrigger id="color">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {colors.map(color => (
                <SelectItem key={color.value} value={color.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 ${color.class} rounded`} />
                    {color.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="icon">ไอคอนองค์กร</Label>
          <Select
            value={formData.icon}
            onValueChange={(value) => handleSelectChange('icon', value)}
          >
            <SelectTrigger id="icon">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {icons.map(icon => {
                const IconComp = icon.component;
                return (
                  <SelectItem key={icon.value} value={icon.value}>
                    <div className="flex items-center gap-2">
                      <IconComp className="w-4 h-4" />
                      {icon.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
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

      {/* Action Buttons */}
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
          disabled={isSaving || !!slugError}
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