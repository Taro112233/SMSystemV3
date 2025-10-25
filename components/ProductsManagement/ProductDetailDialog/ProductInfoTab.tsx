// components/ProductsManagement/ProductDetailDialog/ProductInfoTab.tsx
// ProductInfoTab - Product information form with category attributes

'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Calculator } from 'lucide-react';
import { toast } from 'sonner';

interface ProductUnit {
  id: string;
  name: string;
  conversionRatio: number;
  isActive: boolean;
}

interface CategoryWithOptions {
  id: string;
  key: string;
  label: string;
  displayOrder: number;
  isRequired: boolean;
  options: {
    id: string;
    value: string;
    label: string | null;
    sortOrder: number;
  }[];
}

interface FormData {
  code: string;
  name: string;
  genericName: string;
  description: string;
  baseUnit: string;
  isActive: boolean;
  attributes: { [categoryId: string]: string };
}

interface ProductInfoTabProps {
  product: any;
  categories: CategoryWithOptions[];
  productUnits: ProductUnit[]; // ✅ NEW: Receive preloaded units
  orgSlug: string;
  canManage: boolean;
  onSaveComplete: (updatedProduct: any) => void;
}

export default function ProductInfoTab({
  product,
  categories,
  productUnits, // ✅ NEW: Use preloaded units
  orgSlug,
  canManage,
  onSaveComplete,
}: ProductInfoTabProps) {
  const [loading, setLoading] = useState(false);
  // ✅ REMOVED: unitsLoading state - no longer needed
  // ✅ REMOVED: productUnits state - now comes from props
  const [formData, setFormData] = useState<FormData>({
    code: '',
    name: '',
    genericName: '',
    description: '',
    baseUnit: '',
    isActive: true,
    attributes: {},
  });

  // ✅ REMOVED: Fetch product units useEffect - no longer needed

  // Load product data into form
  useEffect(() => {
    if (product) {
      const attributesMap: { [categoryId: string]: string } = {};
      product.attributes?.forEach((attr: any) => {
        attributesMap[attr.categoryId] = attr.optionId;
      });

      setFormData({
        code: product.code,
        name: product.name,
        genericName: product.genericName || '',
        description: product.description || '',
        baseUnit: product.baseUnit,
        isActive: product.isActive,
        attributes: attributesMap,
      });
    }
  }, [product]);

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAttributeChange = (categoryId: string, optionId: string) => {
    setFormData((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [categoryId]: optionId,
      },
    }));
  };

  const handleSave = async () => {
    if (!product) return;

    // Validation
    if (!formData.code || !formData.name || !formData.baseUnit) {
      toast.error('ข้อมูลไม่ครบถ้วน', {
        description: 'กรุณากรอกรหัสสินค้า ชื่อสินค้า และหน่วยนับ',
      });
      return;
    }

    // Check required categories
    const missingCategories = categories
      .filter((cat) => cat.isRequired && !formData.attributes[cat.id])
      .map((cat) => cat.label);

    if (missingCategories.length > 0) {
      toast.error('ข้อมูลไม่ครบถ้วน', {
        description: `กรุณาเลือก: ${missingCategories.join(', ')}`,
      });
      return;
    }

    setLoading(true);

    try {
      // Convert attributes map to array
      const attributesArray = Object.entries(formData.attributes)
        .filter(([_, optionId]) => optionId)
        .map(([categoryId, optionId]) => ({ categoryId, optionId }));

      const response = await fetch(`/api/${orgSlug}/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          genericName: formData.genericName || null,
          description: formData.description || null,
          attributes: attributesArray,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save product');
      }

      toast.success('สำเร็จ', {
        description: 'แก้ไขข้อมูลสินค้าเรียบร้อย',
      });

      onSaveComplete(data.product);
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error('เกิดข้อผิดพลาด', {
        description: error.message || 'ไม่สามารถบันทึกข้อมูลได้',
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryOptionLabel = (categoryId: string, optionId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return '-';
    
    const option = category.options.find(o => o.id === optionId);
    return option ? (option.label || option.value) : '-';
  };

  const getUnitDisplayInfo = (unitName: string) => {
    const unit = productUnits.find(u => u.name === unitName);
    if (!unit) return null;
    
    return {
      name: unit.name,
      ratio: unit.conversionRatio,
      displayText: `${unit.name} (1:${unit.conversionRatio.toLocaleString('th-TH')})`
    };
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Basic Info Section */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900">ข้อมูลพื้นฐาน</h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="code">
              รหัสสินค้า <span className="text-red-500">*</span>
            </Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
              placeholder="เช่น MED001"
              disabled={loading || !canManage}
            />
          </div>

          {/* Base Unit - ✅ UPDATED: Remove loading state, simplify logic */}
          <div className="space-y-2">
            <Label htmlFor="baseUnit">
              หน่วยนับ <span className="text-red-500">*</span>
            </Label>
            {canManage ? (
              productUnits.length > 0 ? (
                <Select
                  value={formData.baseUnit}
                  onValueChange={(value) => handleChange('baseUnit', value)}
                  disabled={loading}
                >
                  <SelectTrigger id="baseUnit">
                    <SelectValue placeholder="เลือกหน่วยนับ" />
                  </SelectTrigger>
                  <SelectContent>
                    {productUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.name}>
                        <div className="flex items-center gap-2">
                          <span>{unit.name}</span>
                          <span className="text-xs text-gray-500">
                            (1:{unit.conversionRatio.toLocaleString('th-TH')})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 border rounded-md bg-amber-50 border-amber-200">
                  <p className="text-sm text-amber-700">
                    ยังไม่มีหน่วยนับในระบบ กรุณาเพิ่มหน่วยนับก่อน
                  </p>
                </div>
              )
            ) : (
              // Display mode
              <div className="p-2 bg-white border rounded-md">
                {formData.baseUnit ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Calculator className="w-3 h-3 text-gray-500" />
                    <span className="font-medium">{formData.baseUnit}</span>
                    {getUnitDisplayInfo(formData.baseUnit) && (
                      <span className="text-gray-500">
                        (1:{getUnitDisplayInfo(formData.baseUnit)!.ratio.toLocaleString('th-TH')})
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">-</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            ชื่อสินค้า <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="ระบุชื่อสินค้า"
            disabled={loading || !canManage}
          />
        </div>

        {/* Generic Name */}
        <div className="space-y-2">
          <Label htmlFor="genericName">ชื่อสามัญ</Label>
          <Input
            id="genericName"
            value={formData.genericName}
            onChange={(e) => handleChange('genericName', e.target.value)}
            placeholder="ระบุชื่อสามัญ (ถ้ามี)"
            disabled={loading || !canManage}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">รายละเอียด</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="ระบุรายละเอียดเพิ่มเติม"
            className="resize-none"
            rows={3}
            disabled={loading || !canManage}
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg">
          <div className="space-y-1">
            <div className="font-medium">สถานะการใช้งาน</div>
            <div className="text-sm text-gray-600">
              เปิดใช้งานสินค้านี้ในระบบ
            </div>
          </div>
          <Switch
            checked={formData.isActive}
            onCheckedChange={(checked) => handleChange('isActive', checked)}
            disabled={loading || !canManage}
            className="data-[state=checked]:bg-green-600"
          />
        </div>
      </div>

      {/* Category Attributes Section */}
      {categories.length > 0 && (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-gray-900">คุณสมบัติสินค้า</h3>

          <div className="grid grid-cols-2 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="space-y-2">
                <Label htmlFor={`category-${category.id}`}>
                  {category.label}
                  {category.isRequired && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {canManage ? (
                  // Editable mode - show select dropdown
                  <Select
                    value={formData.attributes[category.id] || ''}
                    onValueChange={(value) => handleAttributeChange(category.id, value)}
                    disabled={loading}
                  >
                    <SelectTrigger id={`category-${category.id}`}>
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      {category.options.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label || option.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  // Display mode - show the selected value as text
                  <div className="p-2 bg-white border rounded-md text-sm">
                    {formData.attributes[category.id] 
                      ? getCategoryOptionLabel(category.id, formData.attributes[category.id])
                      : '-'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Button - Show only when user can manage - ✅ UPDATED: Remove unitsLoading */}
      {canManage && (
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              'บันทึก'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}