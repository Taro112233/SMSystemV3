// components/SettingsManagement/ProductUnitSettings/index.tsx
// ProductUnitSettings - Main container for unit management (SIMPLIFIED)
// ============================================

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import type { ProductUnit, UnitFormData } from '@/types/product-unit';
import { UnitList } from './UnitList';

interface ProductUnitSettingsProps {
  units: ProductUnit[];
  organizationId: string;
  organizationSlug: string;
  userRole: 'MEMBER' | 'ADMIN' | 'OWNER';
  isLoading?: boolean;
  onCreate: (data: UnitFormData & { organizationId: string }) => Promise<void>;
  onUpdate: (unitId: string, data: Partial<UnitFormData>) => Promise<void>;
  onDelete: (unitId: string) => Promise<void>;
}

export const ProductUnitSettings = ({
  units,
  organizationId,
  organizationSlug,
  userRole,
  isLoading = false,
  onCreate,
  onUpdate,
  onDelete
}: ProductUnitSettingsProps) => {
  const canManage = ['ADMIN', 'OWNER'].includes(userRole);

  return (
    <div className="space-y-6">
      {!canManage && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            คุณไม่มีสิทธิ์จัดการหน่วยนับ ต้องเป็น ADMIN หรือ OWNER เท่านั้น
          </AlertDescription>
        </Alert>
      )}

      <UnitList
        units={units}
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