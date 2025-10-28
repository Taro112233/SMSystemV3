// components/SettingsManagement/ProductUnitSettings/UnitFormFields.tsx
// UnitFormFields - Simplified form input fields
// ============================================

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Info, Calculator } from 'lucide-react';
import type { UnitFormData } from '@/types/product-unit';

interface UnitFormFieldsProps {
  formData: UnitFormData;
  setFormData: React.Dispatch<React.SetStateAction<UnitFormData>>;
  isEditing: boolean;
}

export const UnitFormFields = ({
  formData,
  setFormData
}: UnitFormFieldsProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, [name]: numValue }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }));
  };

  return (
    <>
      {/* Preview Card */}
      <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-sm text-gray-600 mb-2">ตัวอย่างการแสดงผล:</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">
                  {formData.name || 'ชื่อหน่วยนับ'}
                </span>
                <Badge variant={formData.isActive ? "default" : "secondary"} className={formData.isActive ? "bg-green-500" : ""}>
                  {formData.isActive ? 'ใช้งาน' : 'ปิด'}
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                1 {formData.name || 'หน่วย'} = {formData.conversionRatio.toLocaleString('th-TH')} หน่วย
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          ชื่อหน่วยนับ <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="เช่น: โหล, ลัง, กล่อง, แผง"
          required
        />
        <div className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            ใช้ชื่อที่เข้าใจง่ายและสื่อความหมายชัดเจน
          </p>
        </div>
      </div>

      {/* Conversion Ratio */}
      <div className="space-y-2">
        <Label htmlFor="conversionRatio">
          อัตราส่วนการแปลง <span className="text-red-500">*</span>
        </Label>
        <Input
          id="conversionRatio"
          name="conversionRatio"
          type="number"
          step="0.0001"
          min="0.0001"
          value={formData.conversionRatio}
          onChange={handleNumberChange}
          placeholder="1"
          required
        />
        <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
          <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-700">
            <p className="font-medium mb-1">ตัวอย่างการตั้งค่า:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>โหล = 12 (1 โหล = 12 หน่วย)</li>
              <li>ลัง = 20 (1 ลัง = 20 หน่วย)</li>
              <li>กล่อง = 100 (1 กล่อง = 100 หน่วย)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Active Switch */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="space-y-1">
          <div className="font-medium">เปิดใช้งานหน่วยนับ</div>
          <div className="text-sm text-gray-600">
            หน่วยนับที่ปิดใช้งานจะไม่แสดงในฟอร์มสร้างสินค้า
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