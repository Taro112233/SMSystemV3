// components/ProductsManagement/ProductDetailDialog.tsx
// ProductDetailDialog - View product details with editable form in info tab

'use client';

import { useState, useEffect } from 'react';
import { CategoryWithOptions, getCategoryValue, getCategoryOptionById } from '@/lib/category-helpers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
import { Package, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProductDetailDialogProps {
  product: any | null;
  categories: CategoryWithOptions[];
  orgSlug: string;
  canManage: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditClick: (product: any) => void;
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

interface ProductAttribute {
  categoryId: string;
  optionId: string;
  option?: {
    id?: string;
    label?: string;
    value?: string;
  };
}

export default function ProductDetailDialog({
  product,
  categories,
  orgSlug,
  canManage,
  open,
  onOpenChange,
  onEditClick,
}: ProductDetailDialogProps) {
  const [activeTab, setActiveTab] = useState('stock');
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

  // Mock stock data by department
  const mockStockData = [
    {
      department: 'คลังยาหลัก',
      batches: [
        { lot: 'LOT001', quantity: 500, exp: '2025-12-31' },
        { lot: 'LOT002', quantity: 300, exp: '2026-03-15' },
      ],
    },
    {
      department: 'OPD',
      batches: [{ lot: 'LOT001', quantity: 100, exp: '2025-12-31' }],
    },
    {
      department: 'IPD',
      batches: [{ lot: 'LOT002', quantity: 150, exp: '2026-03-15' }],
    },
  ];

  // Load product data into form
  useEffect(() => {
    if (product && open) {
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
      setActiveTab('stock'); // Reset to stock tab when opening
    }
  }, [product, open]);

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

      onOpenChange(false);
      onEditClick(data.product); // Trigger parent refresh
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error('เกิดข้อผิดพลาด', {
        description: error.message || 'ไม่สามารถบันทึกข้อมูลได้',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            รายละเอียดสินค้า: {product.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stock">
              <Package className="h-4 w-4 mr-2" />
              จำนวนคงเหลือ
            </TabsTrigger>
            <TabsTrigger value="info">
              <Info className="h-4 w-4 mr-2" />
              ข้อมูลสินค้า
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Stock Information (Read-only) */}
          <TabsContent value="stock" className="space-y-4 mt-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">สรุปยอดรวม</h3>
              <p className="text-2xl font-bold text-blue-600">
                1,050 {product.baseUnit}
              </p>
              <p className="text-sm text-gray-600">รวมทุกหน่วยงาน</p>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">รายละเอียดแต่ละหน่วยงาน</h3>

              {mockStockData.map((dept, deptIdx) => (
                <div key={deptIdx} className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <div className="font-medium text-gray-900">{dept.department}</div>

                  <div className="space-y-1.5">
                    {dept.batches.map((batch, batchIdx) => (
                      <div
                        key={batchIdx}
                        className="flex justify-between items-center text-sm bg-white p-2 rounded"
                      >
                        <div>
                          <span className="font-medium">Lot: {batch.lot}</span>
                          <span className="text-gray-500 ml-2">
                            (หมดอายุ: {batch.exp})
                          </span>
                        </div>
                        <div className="font-semibold text-gray-900">
                          {batch.quantity.toLocaleString()} {product.baseUnit}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-sm font-medium text-gray-700 border-t pt-2 mt-2">
                    รวม: {dept.batches.reduce((sum, b) => sum + b.quantity, 0).toLocaleString()}{' '}
                    {product.baseUnit}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Tab 2: Product Information (Editable Form) */}
          <TabsContent value="info" className="space-y-4 mt-4">
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
                    disabled={loading || !canManage}
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
                      {activeTab === 'info' && canManage ? (
                        // Editable mode - show select dropdown
                        <Select
                          value={formData.attributes[category.id] || ''}
                          onValueChange={(value) => handleAttributeChange(category.id, value)}
                          disabled={loading || !canManage}
                        >
                          <SelectTrigger id={`category-${category.id}`}>
                            <SelectValue placeholder={`-`} />
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
                          {formData.attributes[category.id] ? 
                            getCategoryOptionById(categories, category.id, formData.attributes[category.id]) : 
                            '-'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer with Save Button - Show only on info tab and when user can manage */}
        {activeTab === 'info' && canManage && (
          <DialogFooter>
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
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}