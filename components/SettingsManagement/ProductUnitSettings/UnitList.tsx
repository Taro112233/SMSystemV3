// components/SettingsManagement/ProductUnitSettings/UnitList.tsx
// UnitList - List component with search and filtering (SIMPLIFIED)
// ============================================

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Loader2 } from 'lucide-react';
import { SettingsCard } from '../shared/SettingsCard';
import type { ProductUnit, UnitFormData } from '@/types/product-unit';
import { UnitCard } from './UnitCard';
import { UnitFormModal } from './UnitFormModal';

interface UnitListProps {
  units: ProductUnit[];
  organizationId: string;
  organizationSlug: string;
  canManage: boolean;
  isLoading?: boolean;
  onCreate: (data: UnitFormData & { organizationId: string }) => Promise<void>;
  onUpdate: (unitId: string, data: Partial<UnitFormData>) => Promise<void>;
  onDelete: (unitId: string) => Promise<void>;
}

export const UnitList = ({
  units,
  organizationId,
  canManage,
  isLoading = false,
  onCreate,
  onUpdate,
  onDelete
}: UnitListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<ProductUnit | null>(null);

  const filteredUnits = units.filter(unit =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeUnits = filteredUnits.filter(u => u.isActive);
  const inactiveUnits = filteredUnits.filter(u => !u.isActive);

  const handleCreate = async (data: UnitFormData) => {
    await onCreate({ ...data, organizationId });
  };

  const handleUpdate = async (data: UnitFormData) => {
    if (editingUnit) {
      await onUpdate(editingUnit.id, data);
      setEditingUnit(null);
    }
  };

  const handleEdit = (unit: ProductUnit) => {
    setEditingUnit(unit);
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
            <h3 className="text-lg font-semibold">จัดการหน่วยนับสินค้า</h3>
            <p className="text-sm text-gray-600">
              {units.length} หน่วยนับทั้งหมด ({activeUnits.length} ใช้งาน, {inactiveUnits.length} ปิดใช้งาน)
            </p>
          </div>
          {canManage && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มหน่วยนับใหม่
            </Button>
          )}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="ค้นหาหน่วยนับ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </SettingsCard>

      {/* Active Units Section */}
      {activeUnits.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">หน่วยนับที่ใช้งาน</h3>
          <div className="space-y-2">
            {activeUnits.map(unit => (
              <UnitCard
                key={unit.id}
                unit={unit}
                canManage={canManage}
                onEdit={handleEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Units Section */}
      {inactiveUnits.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-500">หน่วยนับที่ปิดใช้งาน</h3>
          <div className="space-y-2">
            {inactiveUnits.map(unit => (
              <UnitCard
                key={unit.id}
                unit={unit}
                canManage={canManage}
                onEdit={handleEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {filteredUnits.length === 0 && (
        <SettingsCard>
          <div className="py-12 text-center text-gray-600">
            {searchTerm ? 'ไม่พบหน่วยนับที่ตรงกับคำค้นหา' : 'ยังไม่มีหน่วยนับสินค้า'}
          </div>
        </SettingsCard>
      )}

      <UnitFormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        organizationId={organizationId}
        onSubmit={handleCreate}
      />

      <UnitFormModal
        open={!!editingUnit}
        onOpenChange={(open) => !open && setEditingUnit(null)}
        organizationId={organizationId}
        unit={editingUnit || undefined}
        onSubmit={handleUpdate}
      />
    </div>
  );
};