// components/SettingsManagement/ProductUnitSettings/UnitCard.tsx
// UnitCard - Individual unit display card (SIMPLIFIED)
// ============================================

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Calculator, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import type { ProductUnit } from '@/types/product-unit';

interface UnitCardProps {
  unit: ProductUnit;
  canManage: boolean;
  onEdit: (unit: ProductUnit) => void;
  onDelete: (unitId: string) => Promise<void>;
}

export const UnitCard = ({
  unit,
  canManage,
  onEdit,
  onDelete
}: UnitCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(unit.id);
      toast.success('ลบหน่วยนับสำเร็จ');
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error('ไม่สามารถลบหน่วยนับได้', {
        description: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className={`${!unit.isActive ? 'opacity-60' : ''} hover:shadow-md transition-shadow`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calculator className="w-5 h-5 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {unit.name}
                </h3>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">อัตราส่วน:</span>
                  <span className="font-medium text-gray-900">
                    1 {unit.name} = {unit.conversionRatio.toLocaleString('th-TH')} หน่วย
                  </span>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {unit.isActive ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  ใช้งาน
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="w-3 h-3 mr-1" />
                  ปิด
                </Badge>
              )}
            </div>

            {/* Actions */}
            {canManage && (
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(unit)}
                  title="แก้ไขหน่วยนับ"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setShowDeleteDialog(true)}
                  title="ลบหน่วยนับ"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="ยืนยันการลบหน่วยนับ"
        description={`คุณแน่ใจหรือไม่ที่จะลบหน่วยนับ "${unit.name}"? การดำเนินการนี้ไม่สามารถย้อนกลับได้`}
        confirmText="ลบหน่วยนับ"
        cancelText="ยกเลิก"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </>
  );
};