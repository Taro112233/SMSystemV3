// components/SettingsManagement/ProductUnitSettings/UnitFormFields.tsx
// UnitFormFields - Reusable form input fields
// ============================================

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Info, AlertTriangle, Calculator } from 'lucide-react';
import type { UnitFormData } from '@/types/product-unit';

interface UnitFormFieldsProps {
  formData: UnitFormData;
  setFormData: React.Dispatch<React.SetStateAction<UnitFormData>>;
  isEditing: boolean;
  hasBaseUnit: boolean;
}

export const UnitFormFields = ({
  formData,
  setFormData,
  isEditing,
  hasBaseUnit
}: UnitFormFieldsProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, [name]: numValue }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
    
    // Auto-set conversion ratio to 1 if marking as base unit
    if (name === 'isBaseUnit' && checked) {
      setFormData(prev => ({ ...prev, conversionRatio: 1 }));
    }
  };

  return (
    <>
      {/* Preview Card */}
      <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-sm text-gray-600 mb-2">ตัวอย่างการแสดงผล:</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 ${formData.isBaseUnit ? 'bg-blue-500' : 'bg-gray-500'} rounded-lg flex items-center justify-center`}>
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">
                  {formData.name || 'ชื่อหน่วยนับ'}
                </span>
                {formData.symbol && (
                  <Badge variant="outline" className="text-xs">
                    {formData.symbol}
                  </Badge>
                )}
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

      {/* Symbol (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="symbol">สัญลักษณ์ (ถ้ามี)</Label>
        <Input
          id="symbol"
          name="symbol"
          value={formData.symbol}
          onChange={handleInputChange}
          placeholder="เช่น: dz (dozen), cs (case)"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">คำอธิบาย</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="อธิบายเกี่ยวกับหน่วยนับนี้..."
          rows={3}
        />
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
          disabled={formData.isBaseUnit}
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

      {/* Display Order */}
      <div className="space-y-2">
        <Label htmlFor="displayOrder">ลำดับการแสดงผล</Label>
        <Input
          id="displayOrder"
          name="displayOrder"
          type="number"
          value={formData.displayOrder}
          onChange={handleNumberChange}
          min="0"
        />
        <p className="text-xs text-gray-500">
          เรียงจากน้อยไปมาก (0 = แสดงก่อน)
        </p>
      </div>

      {/* Base Unit Switch */}
      {!isEditing && !hasBaseUnit && (
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <div className="space-y-1">
            <div className="font-medium text-blue-900">หน่วยนับพื้นฐาน</div>
            <div className="text-sm text-blue-700">
              หน่วยนับที่ใช้เป็นฐาน (อัตราส่วน = 1) เช่น "หน่วย", "ชิ้น", "เม็ด"
            </div>
          </div>
          <Switch
            checked={formData.isBaseUnit}
            onCheckedChange={(checked) => handleSwitchChange('isBaseUnit', checked)}
          />
        </div>
      )}

      {formData.isBaseUnit && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            หน่วยนับพื้นฐานจะมีอัตราส่วน = 1 เสมอ และไม่สามารถลบได้
          </p>
        </div>
      )}

      {isEditing && formData.isBaseUnit && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            ไม่สามารถเปลี่ยนแปลงอัตราส่วนของหน่วยนับพื้นฐานได้
          </p>
        </div>
      )}

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
          onCheckedChange={(checked) => handleSwitchChange('isActive', checked)}
        />
      </div>
    </>
  );
};