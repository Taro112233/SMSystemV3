// FILE: components/SettingsManagement/DepartmentSettings/DepartmentFormFields.tsx
// DepartmentSettings/DepartmentFormFields - Extracted form fields
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
import { getAvailableColors, getAvailableIcons } from '@/lib/department-helpers';

interface DepartmentFormFieldsProps {
  formData: {
    name: string;
    slug: string;
    description: string;
    color: string;
    icon: string;
    isActive: boolean;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  isEditing: boolean;
}

export const DepartmentFormFields = ({
  formData,
  setFormData,
  isEditing
}: DepartmentFormFieldsProps) => {
  const colors = getAvailableColors();
  const icons = getAvailableIcons();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
      // Auto-generate slug from name if creating new department
      ...(name === 'name' && !isEditing ? {
        slug: value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      } : {})
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev: any) => ({ ...prev, isActive: checked }));
  };

  // Get selected color class for preview
  const selectedColor = colors.find(c => c.value === formData.color);
  const SelectedIcon = icons.find(i => i.value === formData.icon)?.component;

  return (
    <>
      {/* Preview Card */}
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

      {/* Department Name */}
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

      {/* Slug */}
      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL) *</Label>
        <Input
          id="slug"
          name="slug"
          value={formData.slug}
          onChange={handleInputChange}
          placeholder="เช่น: emergency, main-pharmacy"
          pattern="[a-z0-9-]+"
          required
        />
        <p className="text-xs text-gray-500">
          ใช้ตัวพิมพ์เล็ก ตัวเลข และเครื่องหมาย - เท่านั้น
        </p>
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

      {/* Color and Icon Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Color */}
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

        {/* Icon */}
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