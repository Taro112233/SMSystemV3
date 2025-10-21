// components/ProductsManagement/ProductDetailDialog.tsx
// ProductDetailDialog - View product details in tabs

'use client';

import { CategoryWithOptions, getCategoryValue } from '@/lib/category-helpers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Package, Info } from 'lucide-react';

interface ProductDetailDialogProps {
  product: any | null;
  categories: CategoryWithOptions[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProductDetailDialog({
  product,
  categories,
  open,
  onOpenChange,
}: ProductDetailDialogProps) {
  if (!product) return null;

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
      batches: [
        { lot: 'LOT001', quantity: 100, exp: '2025-12-31' },
      ],
    },
    {
      department: 'IPD',
      batches: [
        { lot: 'LOT002', quantity: 150, exp: '2026-03-15' },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            รายละเอียดสินค้า: {product.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="stock" className="mt-4">
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

          {/* Tab 1: Stock Information (Mock) */}
          <TabsContent value="stock" className="space-y-4 mt-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">สรุปยอดรวม</h3>
              <p className="text-2xl font-bold text-blue-600">
                1,050 {product.baseUnit}
              </p>
              <p className="text-sm text-gray-600">รวมทุกหน่วยงาน</p>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">รายการคงเหลือแยกตามหน่วยงาน</h3>
              
              {mockStockData.map((dept, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">{dept.department}</h4>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Lot Number</th>
                          <th className="px-3 py-2 text-left">จำนวน</th>
                          <th className="px-3 py-2 text-left">วันหมดอายุ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {dept.batches.map((batch, bIdx) => (
                          <tr key={bIdx}>
                            <td className="px-3 py-2 font-mono">{batch.lot}</td>
                            <td className="px-3 py-2">
                              {batch.quantity.toLocaleString()} {product.baseUnit}
                            </td>
                            <td className="px-3 py-2">{batch.exp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-sm font-medium text-gray-700">
                      รวม: {dept.batches.reduce((sum, b) => sum + b.quantity, 0).toLocaleString()} {product.baseUnit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Tab 2: Product Information */}
          <TabsContent value="info" className="space-y-4 mt-4">
            {/* Basic Info */}
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">ข้อมูลพื้นฐาน</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">รหัสสินค้า</p>
                  <p className="font-medium">{product.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">หน่วยนับ</p>
                  <p className="font-medium">{product.baseUnit}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">ชื่อสินค้า</p>
                  <p className="font-medium">{product.name}</p>
                </div>
                {product.genericName && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">ชื่อสามัญ</p>
                    <p className="font-medium">{product.genericName}</p>
                  </div>
                )}
                {product.description && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">รายละเอียด</p>
                    <p className="text-gray-700">{product.description}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">สถานะ</p>
                  <Badge variant={product.isActive ? 'default' : 'secondary'}>
                    {product.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Category Attributes */}
            {categories.length > 0 && (
              <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-gray-900">คุณสมบัติสินค้า</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {categories.map((category) => (
                    <div key={category.id}>
                      <p className="text-sm text-gray-600">{category.label}</p>
                      <p className="font-medium">
                        {getCategoryValue(product.attributes || [], category.id)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}