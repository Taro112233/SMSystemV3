// components/SettingsManagement/DepartmentForm.tsx
// SettingsManagement/DepartmentForm - Create/Edit department form

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Save, X } from 'lucide-react';
import { getAvailableColors, getAvailableIcons } from '@/lib/department-helpers';
import { toast } from 'sonner';

interface DepartmentFormProps {
  organizationId: string;
  department?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    color?: string;
    icon?: string;
    isActive: boolean;
  };
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export const DepartmentForm = ({
  organizationId,
  department,
  onSubmit,
  onCancel
}: DepartmentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: department?.name || '',
    slug: department?.slug || '',
    description: department?.description || '',
    color: department?.color || 'BLUE',
    icon: department?.icon || 'BUILDING',
    isActive: department?.isActive ?? true,
  });

  const colors = getAvailableColors();
  const icons = getAvailableIcons();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Auto-generate slug from name if creating new department
      ...(name === 'name' && !department ? {
        slug: value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      } : {})
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error('กรุณากรอกชื่อแผนก');
      return false;
    }

    if (!formData.slug.trim()) {
      toast.error('กรุณากรอก Slug');
      return false;
    }

    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      toast.error('Slug ต้องเป็นตัวพิมพ์เล็ก ตัวเลข และ - เท่านั้น');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        ...formData,
        organizationId,
      });
      
      toast.success(department ? 'อัพเดทแผนกสำเร็จ' : 'สร้างแผนกใหม่สำเร็จ');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
      toast.error(department ? 'ไม่สามารถอัพเดทแผนกได้' : 'ไม่สามารถสร้างแผนกได้', {
        description: errorMsg
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get selected color class for preview
  const selectedColor = colors.find(c => c.value === formData.color);
  const SelectedIcon = icons.find(i => i.value === formData.icon)?.component;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Preview Card */}
      <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-sm text-gray-600 mb-2">ตัวอย่าง:</div>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${selectedColor?.class || 'bg-gray-500'} rounded-lg flex items-center justify-center`}>
            {SelectedIcon && <SelectedIcon className="w-6 h-6 text-white" />}
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {formData.name || 'ชื่อแผนก'}
            </div>
            <div className="text-sm text-gray-500 font-mono">
              {formData.slug || 'slug'}
            </div>
          </div>
        </div>
      </div>

      {/* Department Name */}
      <div className="space-y-2">
        <Label htmlFor="name">ชื่อแผนก *</Label>
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
          placeholder="อธิบายเกี่ยวกับแผนกนี้..."
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
          <div className="font-medium">เปิดใช้งานแผนก</div>
          <div className="text-sm text-gray-600">
            แผนกที่ปิดใช้งานจะไม่แสดงในรายการหลัก
          </div>
        </div>
        <Switch
          checked={formData.isActive}
          onCheckedChange={handleSwitchChange}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Save className="w-4 h-4 mr-2 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {department ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างแผนก'}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="w-4 h-4 mr-2" />
          ยกเลิก
        </Button>
      </div>
    </form>
  );
};