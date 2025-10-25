// components/ProductsManagement/ProductDetailDialog/StockSummaryTab.tsx
// StockSummaryTab - FIXED: Show base unit quantity instead of product unit quantity

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, Coins } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface StockBatch {
  id: string;
  lotNumber: string;
  quantity: number;  // จำนวนในหน่วยย่อย (base unit) เช่น เม็ด
  expiryDate: string;
  costPrice?: number;  // ราคาต่อ package (เช่น ฿150 ต่อกล่อง)
}

interface DepartmentStock {
  departmentId: string;
  departmentName: string;
  departmentSlug: string;
  batches: StockBatch[];
  totalQuantity: number;  // รวมจำนวนในหน่วยย่อย
}

interface StockSummaryTabProps {
  productId: string;
  productName: string;
  baseUnit: string;  // เช่น "เม็ด"
  productUnit?: string;  // เช่น "กล่อง", "แผง"
  conversionRatio?: number;  // เช่น 1 กล่อง = 10 เม็ด
  orgSlug: string;
  isLoading?: boolean;
}

export default function StockSummaryTab({
  productId,
  productName,
  baseUnit,
  productUnit = baseUnit,
  conversionRatio = 1,
  orgSlug,
  isLoading = false,
}: StockSummaryTabProps) {
  // TODO: Replace with real API call
  const mockStockData: DepartmentStock[] = [
    {
      departmentId: 'dept-001',
      departmentName: 'คลังยาหลัก',
      departmentSlug: 'main-pharmacy',
      totalQuantity: 800,  // 800 เม็ด
      batches: [
        {
          id: 'batch-001',
          lotNumber: 'LOT001',
          quantity: 500,  // 500 เม็ด
          expiryDate: '2025-12-31',
          costPrice: 150,  // ฿150 ต่อกล่อง (1 กล่อง = 10 เม็ด)
        },
        {
          id: 'batch-002',
          lotNumber: 'LOT002',
          quantity: 300,  // 300 เม็ด
          expiryDate: '2026-03-15',
          costPrice: 160,  // ฿160 ต่อกล่อง
        },
      ],
    },
    {
      departmentId: 'dept-002',
      departmentName: 'OPD',
      departmentSlug: 'opd',
      totalQuantity: 100,
      batches: [
        {
          id: 'batch-003',
          lotNumber: 'LOT001',
          quantity: 100,
          expiryDate: '2025-12-31',
          costPrice: 150,
        },
      ],
    },
    {
      departmentId: 'dept-003',
      departmentName: 'IPD',
      departmentSlug: 'ipd',
      totalQuantity: 150,
      batches: [
        {
          id: 'batch-004',
          lotNumber: 'LOT002',
          quantity: 150,
          expiryDate: '2026-03-15',
          costPrice: 160,
        },
      ],
    },
  ];

  const today = new Date();
  const ninetyDaysFromNow = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

  // ✅ Calculate price per base unit (หน่วย)
  // costPrice (per package) ÷ conversionRatio = price per base unit
  // Example: ฿150 per กล่อง ÷ 10 = ฿15 per เม็ด
  const calculatePricePerBaseUnit = (costPrice: number): number => {
    return costPrice / conversionRatio;
  };

  // ✅ Calculate batch value
  // Value = quantity (in base units) × (costPrice ÷ conversionRatio)
  // Example: 500 เม็ด × ฿15 = ฿7,500
  const calculateBatchValue = (quantity: number, costPrice: number): number => {
    const pricePerBaseUnit = calculatePricePerBaseUnit(costPrice);
    return quantity * pricePerBaseUnit;
  };

  // Calculate grand totals
  const grandTotalQuantity = mockStockData.reduce((sum, dept) => sum + dept.totalQuantity, 0);
  
  const grandTotalValue = mockStockData.reduce(
    (sum, dept) =>
      sum +
      dept.batches.reduce(
        (batchSum, batch) => 
          batchSum + calculateBatchValue(batch.quantity, batch.costPrice || 0),
        0
      ),
    0
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const checkExpiryStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const isExpired = expiry < today;
    const isExpiringSoon = expiry <= ninetyDaysFromNow && expiry > today;
    return { isExpired, isExpiringSoon };
  };

  if (isLoading) {
    return (
      <div className="space-y-4 mt-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-4">
      {/* Overall Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Quantity Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-gray-600 font-medium">จำนวนรวมทั้งหมด</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-blue-700">
                    {grandTotalQuantity.toLocaleString('th-TH')}
                  </span>
                  <span className="text-lg text-gray-600">{baseUnit}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {mockStockData.length} หน่วยงาน
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Value Card */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-gray-600 font-medium">มูลค่ารวม</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-green-700">
                    ฿{formatCurrency(grandTotalValue)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  ราคาเฉลี่ย ฿{formatCurrency(grandTotalQuantity > 0 ? grandTotalValue / grandTotalQuantity : 0)}/{baseUnit}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Cards with Detailed Tables */}
      {mockStockData.map((dept) => {
        // Calculate department totals
        const deptTotalValue = dept.batches.reduce(
          (sum, batch) => sum + calculateBatchValue(batch.quantity, batch.costPrice || 0),
          0
        );

        // ✅ Calculate weighted average cost prices
        const avgCostPerBaseUnit = dept.totalQuantity > 0 
          ? deptTotalValue / dept.totalQuantity 
          : 0;
        
        const avgCostPerProductUnit = avgCostPerBaseUnit * conversionRatio;

        return (
          <Card key={dept.departmentId} className="border-gray-200">
            <CardContent className="p-0">
              {/* Department Header */}
              <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">{dept.departmentName}</h4>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {dept.batches.length} Lot
                </Badge>
              </div>

              {/* Batch Table */}
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[100px]">Lot</TableHead>
                    <TableHead className="w-[130px]">Exp</TableHead>
                    <TableHead className="text-right w-[130px]">
                      ราคาต่อ{productUnit}
                    </TableHead>
                    <TableHead className="text-right w-[130px]">
                      ราคาต่อ{baseUnit}
                    </TableHead>
                    <TableHead className="text-right w-[130px]">
                      คงเหลือ ({baseUnit})
                    </TableHead>
                    <TableHead className="text-right w-[140px]">มูลค่า</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dept.batches.map((batch) => {
                    const { isExpired, isExpiringSoon } = checkExpiryStatus(batch.expiryDate);
                    const batchValue = calculateBatchValue(batch.quantity, batch.costPrice || 0);
                    const pricePerBaseUnit = calculatePricePerBaseUnit(batch.costPrice || 0);

                    return (
                      <TableRow
                        key={batch.id}
                        className={isExpired ? 'bg-red-50' : isExpiringSoon ? 'bg-amber-50' : ''}
                      >
                        <TableCell className="font-medium">{batch.lotNumber}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span
                              className={
                                isExpired
                                  ? 'text-red-600 font-medium text-sm'
                                  : isExpiringSoon
                                  ? 'text-amber-600 font-medium text-sm'
                                  : 'text-sm'
                              }
                            >
                              {formatDate(batch.expiryDate)}
                            </span>
                            {isExpired && (
                              <Badge variant="destructive" className="text-xs ml-1">
                                หมดอายุ
                              </Badge>
                            )}
                            {isExpiringSoon && !isExpired && (
                              <AlertTriangle className="w-3 h-3 text-amber-600 ml-1" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-gray-900">
                          {batch.costPrice
                            ? `฿${formatCurrency(batch.costPrice)}`
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right text-gray-600">
                          {batch.costPrice ? `฿${formatCurrency(pricePerBaseUnit)}` : '-'}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-gray-900">
                          {batch.quantity.toLocaleString('th-TH')}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-700">
                          {batch.costPrice ? `฿${formatCurrency(batchValue)}` : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {/* Department Summary Row */}
                  <TableRow className="bg-blue-50 font-semibold border-t-2">
                    <TableCell colSpan={2} className="text-gray-900">
                      เฉลี่ย/รวม
                    </TableCell>
                    <TableCell className="text-right text-blue-700">
                      ฿{formatCurrency(avgCostPerProductUnit)}
                    </TableCell>
                    <TableCell className="text-right text-blue-700">
                      ฿{formatCurrency(avgCostPerBaseUnit)}
                    </TableCell>
                    <TableCell className="text-right text-blue-700">
                      {dept.totalQuantity.toLocaleString('th-TH')}
                    </TableCell>
                    <TableCell className="text-right text-blue-700">
                      ฿{formatCurrency(deptTotalValue)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}