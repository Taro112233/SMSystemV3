// components/SettingsManagement/DepartmentSettings/DepartmentCard.tsx
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { getIconComponent, mapColorThemeToTailwind } from '@/lib/department-helpers';
import { toast } from 'sonner';
import { ConfirmDialog } from '../shared/ConfirmDialog';

// ✅ เพิ่ม interface สำหรับ Department
interface Department {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DepartmentCardProps {
  department: Department;
  canManage: boolean;
  onEdit: (dept: Department) => void; // ✅ เปลี่ยนจาก any เป็น Department
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
  
  const extractColorEnum = (color: string): string => {
    if (color.startsWith('bg-')) {
      const colorMap: Record<string, string> = {
        'bg-blue-500': 'BLUE',
        'bg-green-500': 'GREEN',
        'bg-red-500': 'RED',
        'bg-yellow-500': 'YELLOW',
        'bg-purple-500': 'PURPLE',
        'bg-pink-500': 'PINK',
        'bg-indigo-500': 'INDIGO',
        'bg-teal-500': 'TEAL',
        'bg-orange-500': 'ORANGE',
        'bg-gray-500': 'GRAY',
      };
      return colorMap[color] || 'BLUE';
    }
    return color;
  };
  
  const colorEnum = extractColorEnum(department.color || 'BLUE');
  const colorClass = mapColorThemeToTailwind(colorEnum);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(department.id);
      toast.success('ลบหน่วยงานสำเร็จ');
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error('ไม่สามารถลบหน่วยงานได้', {
        description: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className={`${!department.isActive ? 'opacity-60' : ''} hover:shadow-lg transition-shadow h-full flex flex-col`}>
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="space-y-3 flex-1 flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-12 h-12 ${colorClass} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
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
              
              {department.isActive ? (
                <Badge variant="default" className="bg-green-500 flex-shrink-0">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  ใช้งาน
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex-shrink-0">
                  <XCircle className="w-3 h-3 mr-1" />
                  ปิด
                </Badge>
              )}
            </div>

            <div className="min-h-[40px]">
              {department.description ? (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {department.description}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  ไม่มีคำอธิบาย
                </p>
              )}
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>
                อัพเดท: {new Date(department.updatedAt).toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>

            {canManage && (
              <div className="flex gap-2 pt-2 border-t mt-auto">
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

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="ยืนยันการลบหน่วยงาน"
        description={`คุณแน่ใจหรือไม่ที่จะลบหน่วยงาน "${department.name}"? การดำเนินการนี้ไม่สามารถย้อนกลับได้`}
        confirmText="ลบหน่วยงาน"
        cancelText="ยกเลิก"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </>
  );
};