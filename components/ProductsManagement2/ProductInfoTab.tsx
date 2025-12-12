// components/ProductsManagement2/ProductInfoTab.tsx
// ProductInfoTab - Product information form

'use client';

import { useState, useEffect } from 'react';
import { ProductData } from '@/types/product';
import { CategoryWithOptions } from '@/lib/category-helpers';
import { ProductUnit } from '@/types/product-unit';
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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
  product: ProductData;
  categories: CategoryWithOptions[];
  productUnits: ProductUnit[];
  orgSlug: string;
  canManage: boolean;
  onSaveComplete: (updatedProduct: ProductData) => void;
}

export default function ProductInfoTab({
  product,
  categories,
  productUnits,
  orgSlug,
  canManage,
  onSaveComplete,
}: ProductInfoTabProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    code: '',
    name: '',
    genericName: '',
    description: '',
    baseUnit: '',
    isActive: true,
    attributes: {},
  });

  useEffect(() => {
    if (product) {
      const attributesMap: { [categoryId: string]: string } = {};
      product.attributes?.forEach((attr) => {
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

  const handleChange = (field: keyof FormData, value: string | boolean) => {
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

    if (!formData.code || !formData.name || !formData.baseUnit) {
      toast.error('ข้อมูลไม่ครบถ้วน');
      return;
    }

    const missingCategories = categories
      .filter((cat) => cat.isRequired && !formData.attributes[cat.id])
      .map((cat) => cat.label);

    if (missingCategories.length > 0) {
      toast.error('กรุณาเลือก: ' + missingCategories.join(', '));
      return;
    }

    setLoading(true);

    try {
      const attributesArray = Object.entries(formData.attributes)
        .filter(([, optionId]) => optionId)
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

      toast.success('บันทึกสำเร็จ');
      onSaveComplete(data.product);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">รหัสสินค้า</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
            disabled={loading || !canManage}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="baseUnit">หน่วยนับ</Label>
          {canManage ? (
            <Select
              value={formData.baseUnit}
              onValueChange={(value) => handleChange('baseUnit', value)}
              disabled={loading}
            >
              <SelectTrigger id="baseUnit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {productUnits.map((unit) => (
                  <SelectItem key={unit.id} value={unit.name}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input value={formData.baseUnit} disabled />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">ชื่อสินค้า</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          disabled={loading || !canManage}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="genericName">ชื่อสามัญ</Label>
        <Input
          id="genericName"
          value={formData.genericName}
          onChange={(e) => handleChange('genericName', e.target.value)}
          disabled={loading || !canManage}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">รายละเอียด</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="resize-none"
          rows={3}
          disabled={loading || !canManage}
        />
      </div>

      {categories.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="space-y-2">
              <Label>{category.label}</Label>
              <Select
                value={formData.attributes[category.id] || ''}
                onValueChange={(value) => handleAttributeChange(category.id, value)}
                disabled={loading || !canManage}
              >
                <SelectTrigger>
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
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Label>สถานะการใช้งาน</Label>
        <Switch
          checked={formData.isActive}
          onCheckedChange={(checked) => handleChange('isActive', checked)}
          disabled={loading || !canManage}
        />
      </div>

      {canManage && (
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={loading}>
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