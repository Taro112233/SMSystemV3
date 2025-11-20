// components/DepartmentStocksManagement/StockDetailDialog/BatchFormModal.tsx
// UPDATED: Fix lint error

'use client';

import { useState, useEffect } from 'react';
import { DepartmentStock, StockBatch, BatchFormData } from '@/types/stock';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Calendar, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface BatchFormModalProps {
  stock: DepartmentStock;
  batch: StockBatch | null;
  orgSlug: string;
  deptSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function BatchFormModal({
  stock,
  batch,
  orgSlug,
  deptSlug,
  open,
  onOpenChange,
  onSuccess,
}: BatchFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<BatchFormData>({
    lotNumber: '',
    expiryDate: undefined,
    manufactureDate: undefined,
    supplier: '',
    costPrice: undefined,
    sellingPrice: undefined,
    quantity: 0,
    location: '',
  });

  useEffect(() => {
    if (batch) {
      setFormData({
        lotNumber: batch.lotNumber,
        expiryDate: batch.expiryDate || undefined,
        manufactureDate: batch.manufactureDate || undefined,
        supplier: batch.supplier || '',
        costPrice: batch.costPrice ? Number(batch.costPrice) : undefined,
        sellingPrice: batch.sellingPrice ? Number(batch.sellingPrice) : undefined,
        quantity: batch.totalQuantity,
        location: batch.location || '',
      });
    } else {
      setFormData({
        lotNumber: '',
        expiryDate: undefined,
        manufactureDate: undefined,
        supplier: '',
        costPrice: undefined,
        sellingPrice: undefined,
        quantity: 0,
        location: stock.location || '',
      });
    }
  }, [batch, stock.location, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.lotNumber || formData.quantity <= 0) {
      toast.error('ข้อมูลไม่ครบถ้วน', {
        description: 'กรุณากรอก Lot Number และจำนวน',
      });
      return;
    }

    setLoading(true);

    try {
      const url = batch
        ? `/api/${orgSlug}/${deptSlug}/stocks/${stock.id}/batches/${batch.id}`
        : `/api/${orgSlug}/${deptSlug}/stocks/${stock.id}/batches`;

      const method = batch ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save batch');
      }

      toast.success('สำเร็จ', {
        description: batch ? 'แก้ไข batch เรียบร้อย' : 'เพิ่ม batch เรียบร้อย',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving batch:', error);
      toast.error('เกิดข้อผิดพลาด', {
        description: error instanceof Error ? error.message : 'ไม่สามารถบันทึกข้อมูลได้',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!batch) return;

    setLoading(true);

    try {
      const response = await fetch(
        `/api/${orgSlug}/${deptSlug}/stocks/${stock.id}/batches/${batch.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete batch');
      }

      toast.success('สำเร็จ', {
        description: 'ลบ batch เรียบร้อย',
      });

      onSuccess();
      onOpenChange(false);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting batch:', error);
      toast.error('เกิดข้อผิดพลาด', {
        description: error instanceof Error ? error.message : 'ไม่สามารถลบ batch ได้',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = <K extends keyof BatchFormData>(field: K, value: BatchFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canDelete = batch && (batch.reservedQuantity === 0 && batch.incomingQuantity === 0);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {batch ? 'แก้ไข Batch' : 'เพิ่ม Batch ใหม่'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mt-4">
              {/* Lot Number & Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lotNumber">
                    Lot Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lotNumber"
                    value={formData.lotNumber}
                    onChange={(e) => handleChange('lotNumber', e.target.value)}
                    placeholder="เช่น LOT001"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">
                    จำนวน ({stock.product.baseUnit}) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity || ''}
                    onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manufactureDate">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    วันที่ผลิต
                  </Label>
                  <Input
                    id="manufactureDate"
                    type="date"
                    value={
                      formData.manufactureDate
                        ? new Date(formData.manufactureDate).toISOString().split('T')[0]
                        : ''
                    }
                    onChange={(e) =>
                      handleChange(
                        'manufactureDate',
                        e.target.value ? new Date(e.target.value) : undefined
                      )
                    }
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    วันหมดอายุ
                  </Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={
                      formData.expiryDate
                        ? new Date(formData.expiryDate).toISOString().split('T')[0]
                        : ''
                    }
                    onChange={(e) =>
                      handleChange(
                        'expiryDate',
                        e.target.value ? new Date(e.target.value) : undefined
                      )
                    }
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="costPrice">ราคาทุน (บาท)</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.costPrice || ''}
                    onChange={(e) =>
                      handleChange('costPrice', parseFloat(e.target.value) || undefined)
                    }
                    placeholder="0.00"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">ราคาขาย (บาท)</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.sellingPrice || ''}
                    onChange={(e) =>
                      handleChange('sellingPrice', parseFloat(e.target.value) || undefined)
                    }
                    placeholder="0.00"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Supplier & Location */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">ผู้จำหน่าย</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => handleChange('supplier', e.target.value)}
                    placeholder="ชื่อผู้จำหน่าย"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">ตำแหน่งเก็บ</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="เช่น ชั้น A-1"
                    disabled={loading}
                  />
                </div>
              </div>

              {batch && !canDelete && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
                  <strong>หมายเหตุ:</strong> ไม่สามารถลบ batch ที่มีจำนวนจองหรือรอรับได้
                </div>
              )}
            </div>

            <DialogFooter className="mt-6">
              <div className="flex items-center justify-between w-full">
                {/* Delete Button - Left Side */}
                <div>
                  {batch && canDelete && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      ลบ Batch
                    </Button>
                  )}
                </div>

                {/* Cancel & Save Buttons - Right Side */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={loading}
                  >
                    ยกเลิก
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        กำลังบันทึก...
                      </>
                    ) : batch ? (
                      'บันทึกการแก้ไข'
                    ) : (
                      'เพิ่ม Batch'
                    )}
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ Batch</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบ Batch <strong>{batch?.lotNumber}</strong> ใช่หรือไม่?
              <br />
              การกระทำนี้ไม่สามารถยกเลิกได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  กำลังลบ...
                </>
              ) : (
                'ลบ Batch'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}