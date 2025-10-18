// components/SettingsManagement/ProductCategorySettings/CategoryFormModal.tsx
// CategoryFormModal - FIXED imports
// ============================================

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CategoryFormFields } from './CategoryFormFields';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import { toast } from 'sonner';
import type { 
  ProductAttributeCategory, 
  CategoryFormData 
} from '@/types/product-category';  // ✅ Import from shared types

interface CategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  category?: ProductAttributeCategory;
  onSubmit: (data: CategoryFormData) => Promise<void>;
}

export const CategoryFormModal = ({
  open,
  onOpenChange,
  organizationId,
  category,
  onSubmit,
}: CategoryFormModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<CategoryFormData>({
    key: category?.key || '',
    label: category?.label || '',
    description: category?.description || '',
    options: category?.options.map(opt => opt.value) || [],
    displayOrder: category?.displayOrder || 0,
    isRequired: category?.isRequired ?? false,
    isActive: category?.isActive ?? true,
  });

  React.useEffect(() => {
    if (open) {
      setFormData({
        key: category?.key || '',
        label: category?.label || '',
        description: category?.description || '',
        options: category?.options.map(opt => opt.value) || [],
        displayOrder: category?.displayOrder || 0,
        isRequired: category?.isRequired ?? false,
        isActive: category?.isActive ?? true,
      });
    }
  }, [open, category]);

  const validateForm = (): boolean => {
    if (!formData.label.trim()) {
      toast.error('กรุณากรอกชื่อหมวดหมู่');
      return false;
    }

    if (!formData.key.trim()) {
      toast.error('กรุณากรอก Key');
      return false;
    }

    if (!/^[a-z0-9_]+$/.test(formData.key)) {
      toast.error('Key ไม่ถูกต้อง', {
        description: 'ใช้ตัวอักษรพิมพ์เล็ก ตัวเลข และ underscore เท่านั้น'
      });
      return false;
    }

    if (formData.options.length === 0) {
      toast.error('กรุณาเพิ่มอย่างน้อย 1 ตัวเลือก');
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
      
      toast.success(category ? 'อัพเดทหมวดหมู่สำเร็จ' : 'สร้างหมวดหมู่ใหม่สำเร็จ');
      onOpenChange(false);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
      toast.error(category ? 'ไม่สามารถอัพเดทหมวดหมู่ได้' : 'ไม่สามารถสร้างหมวดหมู่ได้', {
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
            {category ? 'แก้ไขหมวดหมู่สินค้า' : 'เพิ่มหมวดหมู่สินค้าใหม่'}
          </DialogTitle>
          <DialogDescription>
            {category 
              ? 'แก้ไขข้อมูลหมวดหมู่สินค้าของคุณ'
              : 'สร้างหมวดหมู่สินค้าใหม่สำหรับการจัดประเภทสินค้า'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <CategoryFormFields
            formData={formData}
            setFormData={setFormData}
            isEditing={!!category}
          />

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
                  {category ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างหมวดหมู่'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};