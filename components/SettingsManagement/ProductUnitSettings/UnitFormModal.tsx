// components/SettingsManagement/ProductUnitSettings/UnitFormModal.tsx
// UnitFormModal - Create/Edit modal dialog (SIMPLIFIED)
// ============================================

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import { toast } from 'sonner';
import type { ProductUnit, UnitFormData } from '@/types/product-unit';
import { UnitFormFields } from './UnitFormFields';

interface UnitFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  unit?: ProductUnit;
  onSubmit: (data: UnitFormData) => Promise<void>;
}

export const UnitFormModal = ({
  open,
  onOpenChange,
  unit,
  onSubmit,
}: UnitFormModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<UnitFormData>({
    name: unit?.name || '',
    conversionRatio: unit?.conversionRatio || 1,
    isActive: unit?.isActive ?? true,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        name: unit?.name || '',
        conversionRatio: unit?.conversionRatio || 1,
        isActive: unit?.isActive ?? true,
      });
    }
  }, [open, unit]);

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error('กรุณากรอกชื่อหน่วยนับ');
      return false;
    }

    if (formData.conversionRatio <= 0) {
      toast.error('อัตราส่วนการแปลงต้องมากกว่า 0');
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
      await onSubmit(formData);
      
      toast.success(unit ? 'อัพเดทหน่วยนับสำเร็จ' : 'สร้างหน่วยนับใหม่สำเร็จ');
      onOpenChange(false);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
      toast.error(unit ? 'ไม่สามารถอัพเดทหน่วยนับได้' : 'ไม่สามารถสร้างหน่วยนับได้', {
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
            {unit ? 'แก้ไขหน่วยนับ' : 'เพิ่มหน่วยนับใหม่'}
          </DialogTitle>
          <DialogDescription>
            {unit 
              ? 'แก้ไขข้อมูลหน่วยนับสินค้า'
              : 'สร้างหน่วยนับใหม่สำหรับการแปลงและคำนวณสต็อก'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <UnitFormFields
            formData={formData}
            setFormData={setFormData}
            isEditing={!!unit}
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
                  {unit ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างหน่วยนับ'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};