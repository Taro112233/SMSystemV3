// FILE: components/SettingsManagement/DepartmentSettings/DepartmentFormModal.tsx
// DepartmentSettings/DepartmentFormModal - Modal wrapper with organizationSlug
// ============================================

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DepartmentFormFields } from './DepartmentFormFields';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface DepartmentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  organizationSlug?: string; // ✅ NEW: For URL preview
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
}

export const DepartmentFormModal = ({
  open,
  onOpenChange,
  organizationId,
  organizationSlug, // ✅ NEW
  department,
  onSubmit,
}: DepartmentFormModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: department?.name || '',
    slug: department?.slug || '',
    description: department?.description || '',
    color: department?.color || 'BLUE',
    icon: department?.icon || 'BUILDING',
    isActive: department?.isActive ?? true,
  });

  // Reset form when department changes or modal opens
  React.useEffect(() => {
    if (open) {
      setFormData({
        name: department?.name || '',
        slug: department?.slug || '',
        description: department?.description || '',
        color: department?.color || 'BLUE',
        icon: department?.icon || 'BUILDING',
        isActive: department?.isActive ?? true,
      });
    }
  }, [open, department]);

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error('กรุณากรอกชื่อหน่วยงาน');
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
      
      toast.success(department ? 'อัพเดทหน่วยงานสำเร็จ' : 'สร้างหน่วยงานใหม่สำเร็จ');
      onOpenChange(false);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
      toast.error(department ? 'ไม่สามารถอัพเดทหน่วยงานได้' : 'ไม่สามารถสร้างหน่วยงานได้', {
        description: errorMsg
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {department ? 'แก้ไขหน่วยงาน' : 'เพิ่มหน่วยงานใหม่'}
          </DialogTitle>
          <DialogDescription>
            {department 
              ? 'แก้ไขข้อมูลหน่วยงานของคุณ'
              : 'กรอกข้อมูลเพื่อสร้างหน่วยงานใหม่'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Form Fields - ✅ Pass organizationSlug */}
          <DepartmentFormFields
            formData={formData}
            setFormData={setFormData}
            isEditing={!!department}
            organizationSlug={organizationSlug}
          />

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              ยกเลิก
            </Button>
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
                  {department ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างหน่วยงาน'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};