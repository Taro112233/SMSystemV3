// FILE: components/SettingsManagement/DepartmentSettings/DepartmentForm.tsx
// DepartmentSettings/DepartmentForm - Create/edit form
// ============================================

import React, { useState } from 'react';
import { DepartmentFormFields } from './DepartmentFormFields';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Fields */}
      <DepartmentFormFields
        formData={formData}
        setFormData={setFormData}
        isEditing={!!department}
      />

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