// components/SettingsManagement/ProductCategorySettings/CategoryFormFields.tsx
// CategoryFormFields - FIXED imports
// ============================================

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Info, AlertTriangle } from 'lucide-react';
import type { CategoryFormData } from '@/types/product-category';  // ✅ Import from shared types

interface CategoryFormFieldsProps {
  formData: CategoryFormData;
  setFormData: React.Dispatch<React.SetStateAction<CategoryFormData>>;
  isEditing: boolean;
}

export const CategoryFormFields = ({
  formData,
  setFormData,
  isEditing
}: CategoryFormFieldsProps) => {
  const [newOptionInput, setNewOptionInput] = React.useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, idx) => 
        idx === index ? value : opt
      )
    }));
  };

  const deleteOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, idx) => idx !== index)
    }));
  };

  const addNewOption = () => {
    const trimmed = newOptionInput.trim();
    if (trimmed && !formData.options.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, trimmed]
      }));
      setNewOptionInput('');
    }
  };

  return (
    <>
      {/* Preview */}
      <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-sm text-gray-600 mb-2">ตัวอย่าง:</div>
        <div className="space-y-2">
          <div className="font-semibold text-gray-900">
            {formData.label || 'ชื่อหมวดหมู่'}
            {formData.isRequired && <span className="text-red-500 ml-1">*</span>}
          </div>
          <div className="text-sm text-gray-500 font-mono">
            {formData.key || 'key'}
          </div>
          {formData.options.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {formData.options.map((opt, idx) => (
                <Badge key={idx} variant="secondary">{opt}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Label */}
      <div className="space-y-2">
        <Label htmlFor="label">ชื่อหมวดหมู่ *</Label>
        <Input
          id="label"
          name="label"
          value={formData.label}
          onChange={handleInputChange}
          placeholder="เช่น: รูปแบบยา, ประเภทยา, ความแรง"
          required
        />
      </div>

      {/* Key */}
      <div className="space-y-2">
        <Label htmlFor="key">Key (ใช้ในโค้ด) *</Label>
        <Input
          id="key"
          name="key"
          value={formData.key}
          onChange={handleInputChange}
          placeholder="เช่น: dosage_form, drug_type, strength"
          pattern="[a-z0-9_]+"
          required
          disabled={isEditing}
        />
        <div className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            ใช้ตัวอักษรพิมพ์เล็ก ตัวเลข และ underscore เท่านั้น (เช่น drug_type)
          </p>
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
          placeholder="อธิบายเกี่ยวกับหมวดหมู่นี้..."
          rows={3}
        />
      </div>

      {/* Options */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>ตัวเลือก * (อย่างน้อย 1 ตัวเลือก)</Label>
          {isEditing && formData.options.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <AlertTriangle className="w-3 h-3" />
              <span>การแก้ไขจะส่งผลกับสินค้าที่ใช้หมวดหมู่นี้</span>
            </div>
          )}
        </div>

        {formData.options.length > 0 && (
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg border">
            <div className="text-xs text-gray-600 mb-2">ตัวเลือกปัจจุบัน:</div>
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`ตัวเลือกที่ ${index + 1}`}
                    className="h-9"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => deleteOption(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                  title="ลบตัวเลือกนี้"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <div className="text-xs text-gray-600">เพิ่มตัวเลือกใหม่:</div>
          <div className="flex gap-2">
            <Input
              value={newOptionInput}
              onChange={(e) => setNewOptionInput(e.target.value)}
              placeholder="พิมพ์ตัวเลือกใหม่ เช่น: ยาเม็ด, ยาน้ำ"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addNewOption();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addNewOption}
              disabled={!newOptionInput.trim()}
              className="flex-shrink-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              เพิ่ม
            </Button>
          </div>
        </div>

        {formData.options.length === 0 && (
          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <p className="text-sm text-red-600">
              กรุณาเพิ่มอย่างน้อย 1 ตัวเลือก
            </p>
          </div>
        )}

        {newOptionInput.trim() && formData.options.includes(newOptionInput.trim()) && (
          <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <p className="text-sm text-amber-600">
              ตัวเลือกนี้มีอยู่แล้ว
            </p>
          </div>
        )}
      </div>

      {/* Display Order */}
      <div className="space-y-2">
        <Label htmlFor="displayOrder">ลำดับการแสดงผล</Label>
        <Input
          id="displayOrder"
          name="displayOrder"
          type="number"
          value={formData.displayOrder}
          onChange={handleInputChange}
          min="0"
        />
        <p className="text-xs text-gray-500">
          เรียงจากน้อยไปมาก (0 = แสดงก่อน)
        </p>
      </div>

      {/* Switches */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="space-y-1">
            <div className="font-medium">บังคับกรอก</div>
            <div className="text-sm text-gray-600">
              ต้องระบุค่าเมื่อสร้างสินค้า
            </div>
          </div>
          <Switch
            checked={formData.isRequired}
            onCheckedChange={(checked) => handleSwitchChange('isRequired', checked)}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="space-y-1">
            <div className="font-medium">เปิดใช้งานหมวดหมู่</div>
            <div className="text-sm text-gray-600">
              หมวดหมู่ที่ปิดใช้งานจะไม่แสดงในฟอร์มสร้างสินค้า
            </div>
          </div>
          <Switch
            checked={formData.isActive}
            onCheckedChange={(checked) => handleSwitchChange('isActive', checked)}
          />
        </div>
      </div>
    </>
  );
};