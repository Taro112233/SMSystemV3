// components/SettingsManagement/ProductCategorySettings/CategoryList.tsx
// CategoryList - FIXED imports
// ============================================

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Loader2 } from 'lucide-react';
import { SettingsCard } from '../shared/SettingsCard';
import { CategoryCard } from './CategoryCard';
import { CategoryFormModal } from './CategoryFormModal';
import type { 
  ProductAttributeCategory, 
  CategoryFormData 
} from '@/types/product-category';  // ✅ Import from shared types

interface CategoryListProps {
  categories: ProductAttributeCategory[];
  organizationId: string;
  organizationSlug: string;
  canManage: boolean;
  isLoading?: boolean;
  onCreate: (data: CategoryFormData & { organizationId: string }) => Promise<void>;
  onUpdate: (categoryId: string, data: Partial<CategoryFormData>) => Promise<void>;
  onDelete: (categoryId: string) => Promise<void>;
}

export const CategoryList = ({
  categories,
  organizationId,
  canManage,
  isLoading = false,
  onCreate,
  onUpdate,
  onDelete
}: CategoryListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductAttributeCategory | null>(null);

  const filteredCategories = categories.filter(cat =>
    cat.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.options.some(opt => opt.value.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeCategories = filteredCategories.filter(c => c.isActive);
  const inactiveCategories = filteredCategories.filter(c => !c.isActive);

  const handleCreate = async (data: CategoryFormData) => {
    await onCreate({ ...data, organizationId });
  };

  const handleUpdate = async (data: CategoryFormData) => {
    if (editingCategory) {
      await onUpdate(editingCategory.id, data);
      setEditingCategory(null);
    }
  };

  const handleEdit = (cat: ProductAttributeCategory) => {
    setEditingCategory(cat);
  };

  if (isLoading) {
    return (
      <SettingsCard>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </SettingsCard>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsCard>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">จัดการหมวดหมู่สินค้า</h3>
            <p className="text-sm text-gray-600">
              {categories.length} หมวดหมู่ทั้งหมด ({activeCategories.length} ใช้งาน, {inactiveCategories.length} ปิดใช้งาน)
            </p>
          </div>
          {canManage && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มหมวดหมู่ใหม่
            </Button>
          )}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="ค้นหาหมวดหมู่..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </SettingsCard>

      {activeCategories.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">หมวดหมู่ที่ใช้งาน</h3>
          <div className="space-y-2">
            {activeCategories.map(cat => (
              <CategoryCard
                key={cat.id}
                category={cat}
                canManage={canManage}
                onEdit={handleEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {inactiveCategories.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-500">หมวดหมู่ที่ปิดใช้งาน</h3>
          <div className="space-y-2">
            {inactiveCategories.map(cat => (
              <CategoryCard
                key={cat.id}
                category={cat}
                canManage={canManage}
                onEdit={handleEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {filteredCategories.length === 0 && (
        <SettingsCard>
          <div className="py-12 text-center text-gray-600">
            {searchTerm ? 'ไม่พบหมวดหมู่ที่ตรงกับคำค้นหา' : 'ยังไม่มีหมวดหมู่สินค้า'}
          </div>
        </SettingsCard>
      )}

      <CategoryFormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        organizationId={organizationId}
        onSubmit={handleCreate}
      />

      <CategoryFormModal
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
        organizationId={organizationId}
        category={editingCategory || undefined}
        onSubmit={handleUpdate}
      />
    </div>
  );
};