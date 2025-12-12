// components/ProductsManagement/ProductDetailDialog/StockSummaryTab.tsx
// StockSummaryTab - UPDATED: Add skeleton loading

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, AlertTriangle, Coins } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface StockBatch {
  id: string;
  lotNumber: string;
  quantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  incomingQuantity: number;
  expiryDate: Date | null;
  manufactureDate: Date | null;
  supplier: string | null;
  costPrice: number | null;
  sellingPrice: number | null;
  location: string | null;
  status: string;
}

interface DepartmentStock {
  departmentId: string;
  departmentName: string;
  departmentSlug: string;
  totalQuantity: number;
  availableQuantity: number;
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

        if (!response.ok) {
          throw new Error('Failed to fetch stocks');
        }

        const data = await response.json();
        setDepartmentStocks(data.data.departments || []);
      } catch (error) {
        console.error('Error fetching stocks:', error);
        toast.error('เกิดข้อผิดพลาด', {
          description: 'ไม่สามารถโหลดข้อมูลสต็อกได้',
        });
        setDepartmentStocks([]);
      } finally {
        setLoading(false);
      }
    };

    if (productId && orgSlug) {
      fetchStocks();
    }
  }, [productId, orgSlug]);

  const today = new Date();
  const ninetyDaysFromNow = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

  const calculateBatchValue = (quantity: number, costPrice: number | null): number => {
    if (!costPrice) return 0;
    return quantity * costPrice;
  };

  const grandTotalQuantity = departmentStocks.reduce(
    (sum, dept) => sum + dept.totalQuantity,
    0
  );

  const grandTotalAvailable = departmentStocks.reduce(
    (sum, dept) => sum + dept.availableQuantity,
    0
  );

  const grandTotalValue = departmentStocks.reduce(
    (sum, dept) =>
      sum +
      dept.batches.reduce(
        (batchSum, batch) =>
          batchSum + calculateBatchValue(batch.quantity, batch.costPrice),
        0
      ),
    0
  );

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('th-TH', {
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

  const checkExpiryStatus = (expiryDate: Date | null) => {
    if (!expiryDate) return { isExpired: false, isExpiringSoon: false };
    
    const expiry = new Date(expiryDate);
    const isExpired = expiry < today;
    const isExpiringSoon = expiry <= ninetyDaysFromNow && expiry > today;
    return { isExpired, isExpiringSoon };
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      AVAILABLE: { label: 'พร้อมใช้', className: 'bg-green-100 text-green-800 border-green-200' },
      RESERVED: { label: 'จองแล้ว', className: 'bg-orange-100 text-orange-800 border-orange-200' },
      QUARANTINE: { label: 'กักกัน', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      DAMAGED: { label: 'เสียหาย', className: 'bg-red-100 text-red-800 border-red-200' },
      EXPIRED: { label: 'หมดอายุ', className: 'bg-gray-100 text-gray-800 border-gray-200' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: 'bg-gray-100 text-gray-800',
    };

    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (departmentStocks.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">ยังไม่มีสต็อกในระบบ</p>
        <p className="text-sm text-gray-500 mt-1">
          เริ่มต้นโดยการเพิ่มสินค้าเข้าสู่หน่วยงานต่าง ๆ
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 mt-4"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {departmentStocks.length} หน่วยงาน • ใช้ได้ {grandTotalAvailable.toLocaleString('th-TH')}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

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
                  ราคาเฉลี่ย ฿
                  {formatCurrency(
                    grandTotalQuantity > 0 ? grandTotalValue / grandTotalQuantity : 0
                  )}
                  /{baseUnit}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Cards */}
      {departmentStocks.map((dept, index) => {
        const deptTotalValue = dept.batches.reduce(
          (sum, batch) => sum + calculateBatchValue(batch.quantity, batch.costPrice),
          0
        );

        const avgCostPerBaseUnit =
          dept.totalQuantity > 0 ? deptTotalValue / dept.totalQuantity : 0;

        return (
          <motion.div
            key={dept.departmentId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="border-gray-200">
              <CardContent className="p-0">
                <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">{dept.departmentName}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {dept.batches.length} Lot
                    </Badge>
                    <span className="text-sm text-gray-600">
                      รวม {dept.totalQuantity.toLocaleString('th-TH')} {baseUnit}
                    </span>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[100px]">Lot</TableHead>
                      <TableHead className="w-[130px]">Exp</TableHead>
                      <TableHead className="text-center w-[100px]">สถานะ</TableHead>
                      <TableHead className="text-right w-[100px]">ราคาต่อ{baseUnit}</TableHead>
                      <TableHead className="text-right w-[100px]">คงเหลือ</TableHead>
                      <TableHead className="text-right w-[100px]">ใช้ได้</TableHead>
                      <TableHead className="text-right w-[120px]">มูลค่า</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dept.batches.map((batch) => {
                      const { isExpired, isExpiringSoon } = checkExpiryStatus(batch.expiryDate);
                      const batchValue = calculateBatchValue(batch.quantity, batch.costPrice);

                      return (
                        <TableRow
                          key={batch.id}
                          className={
                            isExpired ? 'bg-red-50' : isExpiringSoon ? 'bg-amber-50' : ''
                          }
                        >
                          <TableCell className="font-medium">{batch.lotNumber}</TableCell>
                          <TableCell>
                            {batch.expiryDate ? (
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
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(batch.status)}
                          </TableCell>
                          <TableCell className="text-right text-gray-600">
                            {batch.costPrice ? `฿${formatCurrency(batch.costPrice)}` : '-'}
                          </TableCell>
                          <TableCell className="text-right font-medium text-gray-900">
                            {batch.quantity.toLocaleString('th-TH')}
                          </TableCell>
                          <TableCell className="text-right text-green-700 font-medium">
                            {batch.availableQuantity.toLocaleString('th-TH')}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-green-700">
                            {batch.costPrice ? `฿${formatCurrency(batchValue)}` : '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    <TableRow className="bg-blue-50 font-semibold border-t-2">
                      <TableCell colSpan={3} className="text-gray-900">
                        รวม/เฉลี่ย
                      </TableCell>
                      <TableCell className="text-right text-blue-700">
                        ฿{formatCurrency(avgCostPerBaseUnit)}
                      </TableCell>
                      <TableCell className="text-right text-blue-700">
                        {dept.totalQuantity.toLocaleString('th-TH')}
                      </TableCell>
                      <TableCell className="text-right text-blue-700">
                        {dept.availableQuantity.toLocaleString('th-TH')}
                      </TableCell>
                      <TableCell className="text-right text-blue-700">
                        ฿{formatCurrency(deptTotalValue)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}