// components/SettingsManagement/ProductCategorySettings/index.tsx
// ProductCategorySettings - FIXED imports
// ============================================

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { CategoryList } from './CategoryList';
import type { 
  ProductAttributeCategory, 
  CategoryFormData 
} from '@/types/product-category';  // ✅ Import from shared types

interface ProductCategorySettingsProps {
  categories: ProductAttributeCategory[];  // ✅ Use shared type
  organizationId: string;
  organizationSlug: string;
  userRole: 'MEMBER' | 'ADMIN' | 'OWNER';
  isLoading?: boolean;
  onCreate: (data: CategoryFormData & { organizationId: string }) => Promise<void>;
  onUpdate: (categoryId: string, data: Partial<CategoryFormData>) => Promise<void>;
  onDelete: (categoryId: string) => Promise<void>;
}

export const ProductCategorySettings = ({
  categories,
  organizationId,
  organizationSlug,
  userRole,
  isLoading = false,
  onCreate,
  onUpdate,
  onDelete
}: ProductCategorySettingsProps) => {
  const canManage = ['ADMIN', 'OWNER'].includes(userRole);

  return (
    <div className="space-y-6">
      {!canManage && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            คุณไม่มีสิทธิ์จัดการหมวดหมู่สินค้า ต้องเป็น ADMIN หรือ OWNER เท่านั้น
          </AlertDescription>
        </Alert>
      )}

      <CategoryList
        categories={categories}
        organizationId={organizationId}
        organizationSlug={organizationSlug}
        canManage={canManage}
        isLoading={isLoading}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </div>
  );
};