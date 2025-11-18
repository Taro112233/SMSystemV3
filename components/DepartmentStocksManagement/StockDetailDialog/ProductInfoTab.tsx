// components/DepartmentStocksManagement/StockDetailDialog/ProductInfoTab.tsx
// ProductInfoTab - Read-only product information display

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface ProductInfoTabProps {
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
}

export default function ProductInfoTab({ product }: ProductInfoTabProps) {
  return (
    <div className="space-y-4 mt-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>หมายเหตุ:</strong> ข้อมูลในหน้านี้เป็นข้อมูลสินค้าจากส่วนกลาง
          ไม่สามารถแก้ไขได้ในหน้านี้
        </p>
      </div>

      {/* Basic Info Section */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900">ข้อมูลพื้นฐาน</h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Code */}
          <div className="space-y-2">
            <Label>รหัสสินค้า</Label>
            <Input value={product.code} disabled className="bg-white" />
          </div>

          {/* Base Unit */}
          <div className="space-y-2">
            <Label>หน่วยนับ</Label>
            <Input value={product.baseUnit} disabled className="bg-white" />
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label>ชื่อสินค้า</Label>
          <Input value={product.name} disabled className="bg-white" />
        </div>

        {/* Generic Name */}
        {product.genericName && (
          <div className="space-y-2">
            <Label>ชื่อสามัญ</Label>
            <Input value={product.genericName} disabled className="bg-white" />
          </div>
        )}
      </div>

      {/* Product Attributes Section */}
      {product.attributes && product.attributes.length > 0 && (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-gray-900">คุณสมบัติสินค้า</h3>

          <div className="grid grid-cols-2 gap-4">
            {product.attributes.map((attr, index) => (
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
    </div>
  );
}