// components/DepartmentStocksManagement/StockDetailDialog/BatchManagementTab.tsx
// BatchManagementTab - Batch/Lot management with add, edit, status change

'use client';

import { useState } from 'react';
import { DepartmentStock, StockBatch, BatchFormData } from '@/types/stock';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, AlertTriangle, Package } from 'lucide-react';
import { toast } from 'sonner';
import BatchFormModal from './BatchFormModal';

interface BatchManagementTabProps {
  stock: DepartmentStock;
  orgSlug: string;
  deptSlug: string;
  canManage: boolean;
  onUpdateSuccess: () => void;
}

export default function BatchManagementTab({
  stock,
  orgSlug,
  deptSlug,
  canManage,
  onUpdateSuccess,
}: BatchManagementTabProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<StockBatch | null>(null);

  const handleAddBatch = () => {
    setSelectedBatch(null);
    setIsFormOpen(true);
  };

  const handleEditBatch = (batch: StockBatch) => {
    setSelectedBatch(batch);
    setIsFormOpen(true);
  };

  const handleStatusChange = async (batchId: string, newStatus: string) => {
    if (!canManage) {
      toast.error('ไม่มีสิทธิ์', {
        description: 'คุณไม่มีสิทธิ์แก้ไขสถานะ batch',
      });
      return;
    }

    try {
      console.log('📡 API Call (Not Implemented):', {
        url: `/api/${orgSlug}/${deptSlug}/stocks/${stock.id}/batches/${batchId}`,
        method: 'PATCH',
        body: { status: newStatus },
      });

      // TODO: Implement API call
      // await fetch(`/api/${orgSlug}/${deptSlug}/stocks/${stock.id}/batches/${batchId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: newStatus }),
      // });

      toast.success('สำเร็จ', {
        description: 'เปลี่ยนสถานะ batch เรียบร้อย',
      });

      onUpdateSuccess();
    } catch (error) {
      console.error('Error changing batch status:', error);
      toast.error('เกิดข้อผิดพลาด', {
        description: 'ไม่สามารถเปลี่ยนสถานะได้',
      });
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'RESERVED':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'QUARANTINE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'DAMAGED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'พร้อมใช้';
      case 'RESERVED':
        return 'จองแล้ว';
      case 'QUARANTINE':
        return 'กักกัน';
      case 'DAMAGED':
        return 'เสียหาย';
      case 'EXPIRED':
        return 'หมดอายุ';
      default:
        return status;
    }
  };

  const today = new Date();
  const ninetyDaysFromNow = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

  return (
    <div className="space-y-4 mt-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-gray-600">คงเหลือรวม</div>
          <div className="text-2xl font-bold text-blue-700 mt-1">
            {stock.totalQuantity.toLocaleString('th-TH')}
          </div>
          <div className="text-xs text-gray-500 mt-1">{stock.product.baseUnit}</div>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm text-gray-600">ใช้ได้</div>
          <div className="text-2xl font-bold text-green-700 mt-1">
            {stock.availableQuantity.toLocaleString('th-TH')}
          </div>
          <div className="text-xs text-gray-500 mt-1">{stock.product.baseUnit}</div>
        </div>

        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="text-sm text-gray-600">จอง</div>
          <div className="text-2xl font-bold text-orange-700 mt-1">
            {stock.reservedQuantity.toLocaleString('th-TH')}
          </div>
          <div className="text-xs text-gray-500 mt-1">{stock.product.baseUnit}</div>
        </div>

        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="text-sm text-gray-600">รอรับ</div>
          <div className="text-2xl font-bold text-purple-700 mt-1">
            {stock.incomingQuantity.toLocaleString('th-TH')}
          </div>
          <div className="text-xs text-gray-500 mt-1">{stock.product.baseUnit}</div>
        </div>
      </div>

      {/* Batch Table */}
      <div className="border rounded-lg">
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">
              รายการ Batch/Lot ({stock.batches.length})
            </h3>
          </div>
          {canManage && (
            <Button onClick={handleAddBatch} size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              เพิ่ม Batch
            </Button>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Lot Number</TableHead>
              <TableHead>Exp Date</TableHead>
              <TableHead className="text-right">ราคาทุน</TableHead>
              <TableHead className="text-right">ราคาขาย</TableHead>
              <TableHead className="text-right">คงเหลือ</TableHead>
              <TableHead className="text-right">ใช้ได้</TableHead>
              <TableHead>ตำแหน่ง</TableHead>
              <TableHead>สถานะ</TableHead>
              {canManage && <TableHead className="text-center">จัดการ</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {stock.batches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManage ? 9 : 8} className="text-center py-8">
                  <div className="text-sm text-gray-500">ไม่มี batch ในสต็อก</div>
                  {canManage && (
                    <Button
                      onClick={handleAddBatch}
                      variant="outline"
                      size="sm"
                      className="mt-3"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      เพิ่ม Batch แรก
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              stock.batches.map((batch) => {
                const isExpired =
                  batch.expiryDate && new Date(batch.expiryDate) < today;
                const isExpiringSoon =
                  batch.expiryDate &&
                  new Date(batch.expiryDate) <= ninetyDaysFromNow &&
                  new Date(batch.expiryDate) > today;

                return (
                  <TableRow
                    key={batch.id}
                    className={
                      isExpired
                        ? 'bg-red-50'
                        : isExpiringSoon
                        ? 'bg-amber-50'
                        : ''
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
                          {isExpiringSoon && !isExpired && (
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                          )}
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {batch.costPrice
                        ? `฿${batch.costPrice.toLocaleString('th-TH', {
                            minimumFractionDigits: 2,
                          })}`
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {batch.sellingPrice
                        ? `฿${batch.sellingPrice.toLocaleString('th-TH', {
                            minimumFractionDigits: 2,
                          })}`
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {batch.totalQuantity.toLocaleString('th-TH')}
                    </TableCell>
                    <TableCell className="text-right text-green-700 font-medium">
                      {batch.availableQuantity.toLocaleString('th-TH')}
                    </TableCell>
                    <TableCell className="text-sm">{batch.location || '-'}</TableCell>
                    <TableCell>
                      {canManage ? (
                        <Select
                          value={batch.status}
                          onValueChange={(value) =>
                            handleStatusChange(batch.id, value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AVAILABLE">พร้อมใช้</SelectItem>
                            <SelectItem value="RESERVED">จองแล้ว</SelectItem>
                            <SelectItem value="QUARANTINE">กักกัน</SelectItem>
                            <SelectItem value="DAMAGED">เสียหาย</SelectItem>
                            <SelectItem value="EXPIRED">หมดอายุ</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge
                          variant="outline"
                          className={getStatusColor(batch.status)}
                        >
                          {getStatusLabel(batch.status)}
                        </Badge>
                      )}
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditBatch(batch)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Batch Form Modal */}
      <BatchFormModal
        stock={stock}
        batch={selectedBatch}
        orgSlug={orgSlug}
        deptSlug={deptSlug}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={onUpdateSuccess}
      />
    </div>
  );
}