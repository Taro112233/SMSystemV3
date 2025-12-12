// components/ProductsManagement2/StockSummaryTab.tsx
// StockSummaryTab - Stock summary by department

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface StockBatch {
  id: string;
  lotNumber: string;
  quantity: number;
  expiryDate: Date | null;
  costPrice: number | null;
}

interface DepartmentStock {
  departmentId: string;
  departmentName: string;
  totalQuantity: number;
  batches: StockBatch[];
}

interface StockSummaryTabProps {
  productId: string;
  orgSlug: string;
  baseUnit: string;
}

export default function StockSummaryTab({
  productId,
  orgSlug,
  baseUnit,
}: StockSummaryTabProps) {
  const [loading, setLoading] = useState(true);
  const [departmentStocks, setDepartmentStocks] = useState<DepartmentStock[]>([]);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/${orgSlug}/products/${productId}/stocks`);
        if (!response.ok) throw new Error('Failed to fetch stocks');
        const data = await response.json();
        setDepartmentStocks(data.data.departments || []);
      } catch (error) {
        console.error('Error fetching stocks:', error);
        toast.error('ไม่สามารถโหลดข้อมูลสต็อกได้');
        setDepartmentStocks([]);
      } finally {
        setLoading(false);
      }
    };

    if (productId && orgSlug) {
      fetchStocks();
    }
  }, [productId, orgSlug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (departmentStocks.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-10 h-10 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">ยังไม่มีสต็อก</p>
      </div>
    );
  }

  const grandTotal = departmentStocks.reduce((sum, dept) => sum + dept.totalQuantity, 0);
  const grandValue = departmentStocks.reduce(
    (sum, dept) =>
      sum +
      dept.batches.reduce(
        (batchSum, batch) => batchSum + (batch.costPrice || 0) * batch.quantity,
        0
      ),
    0
  );

  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">จำนวนรวม</div>
            <div className="text-2xl font-bold text-blue-700">
              {grandTotal.toLocaleString()} {baseUnit}
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">มูลค่ารวม</div>
            <div className="text-2xl font-bold text-green-700">
              ฿{grandValue.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {departmentStocks.map((dept) => (
        <Card key={dept.departmentId}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="font-semibold">{dept.departmentName}</span>
              </div>
              <Badge variant="outline">{dept.batches.length} Lot</Badge>
            </div>

            <div className="space-y-2">
              {dept.batches.map((batch) => (
                <div
                  key={batch.id}
                  className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                >
                  <div>
                    <span className="font-medium">{batch.lotNumber}</span>
                    {batch.expiryDate && (
                      <span className="text-gray-500 ml-2">
                        หมดอายุ: {new Date(batch.expiryDate).toLocaleDateString('th-TH')}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{batch.quantity.toLocaleString()}</div>
                    {batch.costPrice && (
                      <div className="text-xs text-gray-500">
                        ฿{batch.costPrice.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}