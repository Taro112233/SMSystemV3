// components/ProductsManagement2/ProductForm.tsx
// ProductForm - Create/Edit form

'use client';

import { useState, useEffect } from 'react';
import { CategoryWithOptions } from '@/lib/category-helpers';
import { ProductUnit } from '@/types/product-unit';
import { ProductData } from '@/types/product';
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
  orgSlug: string;
  categories: CategoryWithOptions[];
  productUnits: ProductUnit[];
  product: ProductData | null;
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
  attributes: { [categoryId: string]: string };
}

export default function ProductForm({
  orgSlug,
  categories,
  productUnits,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.name || !formData.baseUnit) {
      toast.error('กรุณากรอกข้อมูลที่จำเป็น');
      return;
    }

    setLoading(true);

    try {
      const url = product
        ? `/api/${orgSlug}/products/${product.id}`
        : `/api/${orgSlug}/products`;
      const method = product ? 'PATCH' : 'POST';

      const attributesArray = Object.entries(formData.attributes)
        .filter(([, optionId]) => optionId)
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
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{product ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า'}</DialogTitle>
      </DialogHeader>

      <div className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="code">รหัสสินค้า *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseUnit">หน่วยนับ *</Label>
            <Select
              value={formData.baseUnit}
              onValueChange={(value) => setFormData({ ...formData, baseUnit: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกหน่วย" />
              </SelectTrigger>
              <SelectContent>
                {productUnits.map((unit) => (
                  <SelectItem key={unit.id} value={unit.name}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">ชื่อสินค้า *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="genericName">ชื่อสามัญ</Label>
          <Input
            id="genericName"
            value={formData.genericName}
            onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">รายละเอียด</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="resize-none"
            rows={3}
            disabled={loading}
          />
        </div>

        {categories.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="space-y-2">
                <Label>{cat.label}</Label>
                <Select
                  value={formData.attributes[cat.id] || ''}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      attributes: { ...formData.attributes, [cat.id]: value },
                    })
                  }
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="-" />
                  </SelectTrigger>
                  <SelectContent>
                    {cat.options.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {opt.label || opt.value}
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
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isActive: checked })
            }
            disabled={loading}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          ยกเลิก
        </Button>
        <Button type="submit" disabled={loading}>
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
    </form>
  );
}