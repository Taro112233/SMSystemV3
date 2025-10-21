// components/ProductsManagement/ProductForm.tsx
// ProductForm - Create/Edit form with category support

'use client';

import { useState, useEffect } from 'react';
import { Product } from '@prisma/client';
import { CategoryWithOptions, formatAttributesForForm } from '@/lib/category-helpers';
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
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProductFormProps {
  organizationId: string;
  orgSlug: string;
  categories: CategoryWithOptions[];
  product: any | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  code: string;
  name: string;
  genericName: string;
  description: string;
  baseUnit: string;
  isActive: boolean;
  attributes: { [categoryId: string]: string }; // categoryId -> optionId
}

export default function ProductForm({
  organizationId,
  orgSlug,
  categories,
  product,
  onSuccess,
  onCancel,
}: ProductFormProps) {
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

  // Load existing product data
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.code || !formData.name || !formData.baseUnit) {
      toast.error('ข้อมูลไม่ครบถ้วน', {
        description: 'กรุณากรอกรหัสสินค้า ชื่อสินค้า และหน่วยนับ',
      });
      return;
    }

    // Check required categories
    const missingCategories = categories
      .filter(cat => cat.isRequired && !formData.attributes[cat.id])
      .map(cat => cat.label);

    if (missingCategories.length > 0) {
      toast.error('ข้อมูลไม่ครบถ้วน', {
        description: `กรุณาเลือก: ${missingCategories.join(', ')}`,
      });
      return;
    }

    setLoading(true);

    try {
      const url = product
        ? `/api/${orgSlug}/products/${product.id}`
        : `/api/${orgSlug}/products`;
      
      const method = product ? 'PATCH' : 'POST';

      // Convert attributes map to array
      const attributesArray = Object.entries(formData.attributes)
        .filter(([_, optionId]) => optionId)
        .map(([categoryId, optionId]) => ({ categoryId, optionId }));

      const response = await fetch(url, {
        method,
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

      onSuccess();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error('เกิดข้อผิดพลาด', {
        description: error.message || 'ไม่สามารถบันทึกข้อมูลได้',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAttributeChange = (categoryId: string, optionId: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [categoryId]: optionId,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {product ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4 mt-6">
        {/* Basic Information Section */}
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
                disabled={loading}
                required
              />
            </div>

            {/* Base Unit */}
            <div className="space-y-2">
              <Label htmlFor="baseUnit">
                หน่วยนับ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="baseUnit"
                value={formData.baseUnit}
                onChange={(e) => handleChange('baseUnit', e.target.value)}
                placeholder="เช่น เม็ด, กล่อง, ขวด"
                disabled={loading}
                required
              />
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
              placeholder="ชื่อสินค้า/ยา"
              disabled={loading}
              required
            />
          </div>

          {/* Generic Name */}
          <div className="space-y-2">
            <Label htmlFor="genericName">ชื่อสามัญ</Label>
            <Input
              id="genericName"
              value={formData.genericName}
              onChange={(e) => handleChange('genericName', e.target.value)}
              placeholder="ชื่อสามัญของยา (ถ้ามี)"
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">รายละเอียด</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="รายละเอียดเพิ่มเติม"
              disabled={loading}
              rows={3}
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
                    {category.isRequired && <span className="text-red-500"> *</span>}
                  </Label>
                  <Select
                    value={formData.attributes[category.id] || ''}
                    onValueChange={(value) => handleAttributeChange(category.id, value)}
                    disabled={loading}
                  >
                    <SelectTrigger id={`category-${category.id}`}>
                      <SelectValue placeholder={`เลือก${category.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {!category.isRequired && (
                        <SelectItem value="">ไม่ระบุ</SelectItem>
                      )}
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
          </div>
        )}

        {/* Status */}
        <div className="flex items-center justify-between py-2">
          <Label htmlFor="isActive" className="cursor-pointer">
            เปิดใช้งาน
          </Label>
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => handleChange('isActive', checked)}
            disabled={loading}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          ยกเลิก
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {product ? 'บันทึกการแก้ไข' : 'สร้างสินค้า'}
        </Button>
      </div>
    </form>
  );
}