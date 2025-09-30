// FILE: components/SettingsManagement/DepartmentSettings/DepartmentCard.tsx
// DepartmentSettings/DepartmentCard - Card component
// ============================================

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { getIconComponent, mapColorThemeToTailwind } from '@/lib/department-helpers';
import { toast } from 'sonner';
import { ConfirmDialog } from '../shared/ConfirmDialog';

interface DepartmentCardProps {
  department: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    color?: string;
    icon?: string;
    isActive: boolean;
  };
  canManage: boolean;
  onEdit: (dept: any) => void;
  onDelete: (deptId: string) => Promise<void>;
}

export const DepartmentCard = ({
  department,
  canManage,
  onEdit,
  onDelete
}: DepartmentCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const Icon = getIconComponent(department.icon || 'BUILDING');
  const colorClass = mapColorThemeToTailwind(department.color);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(department.id);
      toast.success('ลบแผนกสำเร็จ');
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error('ไม่สามารถลบแผนกได้');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className={!department.isActive ? 'opacity-60' : ''}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`w-12 h-12 ${colorClass} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-6 h-6 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {department.name}
                  </h4>
                  <p className="text-sm text-gray-500 font-mono">
                    {department.slug}
                  </p>
                </div>
                {!department.isActive && (
                  <Badge variant="secondary" className="text-xs">
                    ปิดใช้งาน
                  </Badge>
                )}
              </div>

              {department.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {department.description}
                </p>
              )}

              {/* Actions */}
              {canManage && (
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(department)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    แก้ไข
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    ลบ
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="ยืนยันการลบแผนก"
        description={`คุณแน่ใจหรือไม่ที่จะลบแผนก "${department.name}"? การดำเนินการนี้ไม่สามารถยกเลิกได้`}
        confirmText="ลบแผนก"
        cancelText="ยกเลิก"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </>
  );
};