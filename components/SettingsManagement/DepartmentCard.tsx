// components/SettingsManagement/DepartmentCard.tsx
// SettingsManagement/DepartmentCard - Individual department card with actions

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { getIconComponent } from '@/lib/department-helpers';
import { toast } from 'sonner';

interface DepartmentCardProps {
  department: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    color?: string;
    icon?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
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

  const IconComponent = getIconComponent(department.icon || 'BUILDING');
  
  // Get color class from color enum
  const getColorClass = (color?: string) => {
    if (!color) return 'bg-gray-500';
    const colorMap: Record<string, string> = {
      'BLUE': 'bg-blue-500',
      'GREEN': 'bg-green-500',
      'RED': 'bg-red-500',
      'YELLOW': 'bg-yellow-500',
      'PURPLE': 'bg-purple-500',
      'PINK': 'bg-pink-500',
      'INDIGO': 'bg-indigo-500',
      'TEAL': 'bg-teal-500',
      'ORANGE': 'bg-orange-500',
      'GRAY': 'bg-gray-500',
    };
    return colorMap[color.toUpperCase()] || 'bg-gray-500';
  };

  const colorClass = getColorClass(department.color);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(department.id);
      toast.success('ลบแผนกสำเร็จ');
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error('ไม่สามารถลบแผนกได้', {
        description: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className={`${!department.isActive ? 'opacity-60' : ''} hover:shadow-lg transition-shadow`}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header with Icon and Status */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${colorClass} rounded-lg flex items-center justify-center`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {department.name}
                  </h3>
                  <p className="text-sm text-gray-500 font-mono">
                    {department.slug}
                  </p>
                </div>
              </div>
              
              {/* Status Badge */}
              {department.isActive ? (
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

            {/* Description */}
            {department.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {department.description}
              </p>
            )}

            {/* Timestamps */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>อัพเดท: {new Date(department.updatedAt).toLocaleDateString('th-TH')}</span>
            </div>

            {/* Actions */}
            {canManage && (
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onEdit(department)}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  แก้ไข
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  ลบ
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบแผนก</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบแผนก "{department.name}"?
              <br />
              <span className="text-red-600 font-medium">
                การดำเนินการนี้ไม่สามารถย้อนกลับได้
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'กำลังลบ...' : 'ลบแผนก'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};