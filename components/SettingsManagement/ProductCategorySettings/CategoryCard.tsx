// components/SettingsManagement/ProductCategorySettings/CategoryCard.tsx
// CategoryCard - FIXED imports
// ============================================

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Tag, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import type { ProductAttributeCategory } from '@/types/product-category';  // ✅ Import from shared types

interface CategoryCardProps {
  category: ProductAttributeCategory;
  canManage: boolean;
  onEdit: (category: ProductAttributeCategory) => void;
  onDelete: (categoryId: string) => Promise<void>;
}

export const CategoryCard = ({
  category,
  canManage,
  onEdit,
  onDelete
}: CategoryCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(category.id);
      toast.success('ลบหมวดหมู่สำเร็จ');
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error('ไม่สามารถลบหมวดหมู่ได้', {
        description: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const maxVisible = 6;
  const activeOptions = category.options.filter(opt => opt.isActive);
  const displayedOptions = activeOptions.slice(0, maxVisible);
  const remainingCount = activeOptions.length - maxVisible;

  return (
    <>
      <Card className={`${!category.isActive ? 'opacity-60' : ''} hover:shadow-md transition-shadow`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Tag className="w-5 h-5 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {category.label}
                </h3>
                <span className="text-xs text-gray-500 font-mono">
                  ({category.key})
                </span>
              </div>
              
              {category.description && (
                <p className="text-sm text-gray-600 truncate mb-2">
                  {category.description}
                </p>
              )}

              <div className="flex items-center gap-1 flex-wrap-none overflow-hidden">
                {displayedOptions.map((option) => (
                  <Badge 
                    key={option.id} 
                    variant="secondary" 
                    className="text-xs flex-shrink-0"
                  >
                    {option.value}
                  </Badge>
                ))}
                {remainingCount > 0 && (
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    ...อีก {remainingCount} รายการ
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {category.isRequired && (
                <Badge variant="outline" className="border-orange-500 text-orange-600">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  บังคับ
                </Badge>
              )}
              
              {category.isActive ? (
                <Badge variant="default" className="bg-green-500">
                  ใช้งาน
                </Badge>
              ) : (
                <Badge variant="secondary">
                  ปิด
                </Badge>
              )}
            </div>

            {canManage && (
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(category)}
                  title="แก้ไขหมวดหมู่"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setShowDeleteDialog(true)}
                  title="ลบหมวดหมู่"
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
        title="ยืนยันการลบหมวดหมู่"
        description={`คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่ "${category.label}"? การดำเนินการนี้ไม่สามารถย้อนกลับได้`}
        confirmText="ลบหมวดหมู่"
        cancelText="ยกเลิก"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </>
  );
};