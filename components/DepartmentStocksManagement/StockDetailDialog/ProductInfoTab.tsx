// components/DepartmentStocksManagement/StockDetailDialog/ProductInfoTab.tsx
// UPDATED: Add editable stock configuration

'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface ProductInfoTabProps {
  stock: {
    id: string;
    location?: string;
    minStockLevel?: number;
    maxStockLevel?: number;
    reorderPoint?: number;
    defaultWithdrawalQty?: number;
    product: {
      id: string;
      code: string;
      name: string;
      genericName?: string;
      baseUnit: string;
      attributes?: Array<{
        categoryId: string;
        optionId: string;
        option: {
          label: string | null;
          value: string;
        };
      }>;
    };
  };
  orgSlug: string;
  deptSlug: string;
  canManage: boolean;
  onUpdateSuccess: () => void;
}

export default function ProductInfoTab({ 
  stock, 
  orgSlug, 
  deptSlug, 
  canManage,
  onUpdateSuccess 
}: ProductInfoTabProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    location: stock.location || '',
    minStockLevel: stock.minStockLevel?.toString() || '',
    maxStockLevel: stock.maxStockLevel?.toString() || '',
    reorderPoint: stock.reorderPoint?.toString() || '',
    defaultWithdrawalQty: stock.defaultWithdrawalQty?.toString() || '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canManage) {
      toast.error('ไม่มีสิทธิ์', {
        description: 'คุณไม่มีสิทธิ์แก้ไขการตั้งค่าสต็อก',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/${orgSlug}/${deptSlug}/stocks/${stock.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: formData.location || null,
            minStockLevel: formData.minStockLevel ? parseInt(formData.minStockLevel) : null,
            maxStockLevel: formData.maxStockLevel ? parseInt(formData.maxStockLevel) : null,
            reorderPoint: formData.reorderPoint ? parseInt(formData.reorderPoint) : null,
            defaultWithdrawalQty: formData.defaultWithdrawalQty ? parseInt(formData.defaultWithdrawalQty) : null,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update stock configuration');
      }

      toast.success('สำเร็จ', {
        description: 'แก้ไขการตั้งค่าสต็อกเรียบร้อย',
      });

      onUpdateSuccess();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('เกิดข้อผิดพลาด', {
        description: error instanceof Error ? error.message : 'ไม่สามารถแก้ไขการตั้งค่าได้',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>หมายเหตุ:</strong> ข้อมูลสินค้าเป็นข้อมูลจากส่วนกลาง
          ไม่สามารถแก้ไขได้ในหน้านี้ แต่สามารถแก้ไขการตั้งค่าสต็อกได้
        </p>
      </div>

      {/* Basic Info Section - Read Only */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900">ข้อมูลพื้นฐาน</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>รหัสสินค้า</Label>
            <Input value={stock.product.code} disabled className="bg-white" />
          </div>

          <div className="space-y-2">
            <Label>หน่วยนับ</Label>
            <Input value={stock.product.baseUnit} disabled className="bg-white" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>ชื่อสินค้า</Label>
          <Input value={stock.product.name} disabled className="bg-white" />
        </div>

        {stock.product.genericName && (
          <div className="space-y-2">
            <Label>ชื่อสามัญ</Label>
            <Input value={stock.product.genericName} disabled className="bg-white" />
          </div>
        )}
      </div>

      {/* Product Attributes Section - Read Only */}
      {stock.product.attributes && stock.product.attributes.length > 0 && (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-gray-900">คุณสมบัติสินค้า</h3>

          <div className="grid grid-cols-2 gap-4">
            {stock.product.attributes.map((attr, index) => (
              <div key={index} className="space-y-2">
                <Label>คุณสมบัติ {index + 1}</Label>
                <div className="p-2 bg-white border rounded-md">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    {attr.option.label || attr.option.value}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock Configuration Section - Editable */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 p-4 bg-green-50 rounded-lg border-2 border-green-200">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">การตั้งค่าสต็อก</h3>
            {canManage && (
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    บันทึกการตั้งค่า
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">ตำแหน่งเก็บ</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="เช่น ชั้น A-1"
              disabled={loading || !canManage}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minStockLevel">สต็อกต่ำสุด</Label>
              <Input
                id="minStockLevel"
                type="number"
                min="0"
                value={formData.minStockLevel}
                onChange={(e) => handleChange('minStockLevel', e.target.value)}
                placeholder="0"
                disabled={loading || !canManage}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxStockLevel">สต็อกสูงสุด</Label>
              <Input
                id="maxStockLevel"
                type="number"
                min="0"
                value={formData.maxStockLevel}
                onChange={(e) => handleChange('maxStockLevel', e.target.value)}
                placeholder="0"
                disabled={loading || !canManage}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reorderPoint">จุดสั่งซื้อ</Label>
              <Input
                id="reorderPoint"
                type="number"
                min="0"
                value={formData.reorderPoint}
                onChange={(e) => handleChange('reorderPoint', e.target.value)}
                placeholder="0"
                disabled={loading || !canManage}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultWithdrawalQty">จำนวนเบิกคงที่</Label>
              <Input
                id="defaultWithdrawalQty"
                type="number"
                min="0"
                value={formData.defaultWithdrawalQty}
                onChange={(e) => handleChange('defaultWithdrawalQty', e.target.value)}
                placeholder="0"
                disabled={loading || !canManage}
              />
            </div>
          </div>

          {!canManage && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
              <strong>หมายเหตุ:</strong> คุณไม่มีสิทธิ์แก้ไขการตั้งค่าสต็อก
            </div>
          )}
        </div>
      </form>
    </div>
  );
}