// components/SettingsManagement/DepartmentSettings/DepartmentFormFields.tsx
// DepartmentFormFields - UPDATED with slug validation
// ============================================

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link2, AlertTriangle, Info } from 'lucide-react';
import { getAvailableColors, getAvailableIcons } from '@/lib/department-helpers';
import { validateDeptSlug, shouldWarnDeptSlug, generateSafeSlug } from '@/lib/slug-validator';

interface DepartmentFormData {
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
}

interface DepartmentFormFieldsProps {
  formData: DepartmentFormData;
  setFormData: React.Dispatch<React.SetStateAction<DepartmentFormData>>;
  isEditing: boolean;
  organizationSlug?: string;
}

export const DepartmentFormFields = ({
  formData,
  setFormData,
  isEditing,
  organizationSlug
}: DepartmentFormFieldsProps) => {
  const colors = getAvailableColors();
  const icons = getAvailableIcons();
  
  const [slugError, setSlugError] = React.useState('');
  const [slugWarning, setSlugWarning] = React.useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
        ...(name === 'name' && !isEditing ? {
          slug: generateSafeSlug(value, false)
        } : {})
      };

      if (name === 'slug' || (name === 'name' && !isEditing)) {
        const slugToValidate = name === 'slug' ? value : newData.slug;
        
        const validation = validateDeptSlug(slugToValidate);
        if (!validation.isValid) {
          setSlugError(validation.error || '');
        } else {
          setSlugError('');
        }

        const warning = shouldWarnDeptSlug(slugToValidate);
        if (warning.shouldWarn) {
          setSlugWarning(warning.message || '');
        } else {
          setSlugWarning('');
        }
      }

      return newData;
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }));
  };

  const getExampleUrl = () => {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'http://localhost:3000';
    
    const orgSlug = organizationSlug || 
      (typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'your-org');
    
    return `${baseUrl}/${orgSlug}/${formData.slug || 'department-slug'}`;
  };

  const selectedColor = colors.find(c => c.value === formData.color);
  const SelectedIcon = icons.find(i => i.value === formData.icon)?.component;

  return (
    <>
      {/* Preview */}
      <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-sm text-gray-600 mb-2">ตัวอย่าง:</div>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${selectedColor?.class || 'bg-gray-500'} rounded-lg flex items-center justify-center`}>
            {SelectedIcon && <SelectedIcon className="w-6 h-6 text-white" />}
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {formData.name || 'ชื่อหน่วยงาน'}
            </div>
            <div className="text-sm text-gray-500 font-mono">
              {formData.slug || 'slug'}
            </div>
          </div>
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">ชื่อหน่วยงาน *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="เช่น: ห้องฉุกเฉิน, คลังยาหลัก"
          required
        />
      </div>

      {/* Slug with validation */}
      <div className="space-y-2">
        <Label htmlFor="slug">Slug *</Label>
        <Input
          id="slug"
          name="slug"
          value={formData.slug}
          onChange={handleInputChange}
          placeholder="เช่น: emergency, main-pharmacy"
          pattern="[a-z0-9-]+"
          required
          className={slugError ? 'border-red-500' : slugWarning ? 'border-amber-500' : ''}
        />
        
        {/* ✅ FIXED: Removed X icon, show only text with triangle icon */}
        {slugError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-600" />
            <p className="text-xs text-red-700 flex-1">{slugError}</p>
          </div>
        )}

        {/* ✅ FIXED: Removed i icon, show only text with info icon */}
        {slugWarning && !slugError && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600" />
            <p className="text-xs text-amber-700 flex-1">{slugWarning}</p>
          </div>
        )}
        
        {/* URL Preview */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Link2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-blue-900 mb-1">
              ตัวอย่าง URL ของหน่วยงาน:
            </div>
            <div className="text-sm font-mono text-blue-700 break-all">
              {getExampleUrl()}
            </div>
          </div>
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
          placeholder="อธิบายเกี่ยวกับหน่วยงานนี้..."
          rows={3}
        />
      </div>

      {/* Color & Icon */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="color">สี</Label>
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
          <Label htmlFor="icon">ไอคอน</Label>
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

      {/* Active Status */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="space-y-1">
          <div className="font-medium">เปิดใช้งานหน่วยงาน</div>
          <div className="text-sm text-gray-600">
            หน่วยงานที่ปิดใช้งานจะไม่แสดงในรายการหลัก
          </div>
        </div>
        <Switch
          checked={formData.isActive}
          onCheckedChange={handleSwitchChange}
        />
      </div>
    </>
  );
};