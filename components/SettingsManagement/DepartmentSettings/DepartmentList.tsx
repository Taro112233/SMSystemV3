// FILE: components/SettingsManagement/DepartmentSettings/DepartmentList.tsx
// DepartmentSettings/DepartmentList - Updated to pass organizationSlug
// ============================================

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Loader2 } from 'lucide-react';
import { SettingsCard } from '../shared/SettingsCard';
import { DepartmentCard } from './DepartmentCard';
import { DepartmentFormModal } from './DepartmentFormModal';

// ✅ NEW: Proper type definitions
interface Department {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ FIXED: Match DepartmentFormModal's interface exactly
interface DepartmentFormData {
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
  organizationId?: string;  // Optional เพราะจะถูกเพิ่มใน handler
}

interface DepartmentListProps {
  departments: Department[];
  organizationId: string;
  organizationSlug: string;
  canManage: boolean;
  isLoading?: boolean;
  onCreate: (data: DepartmentFormData & { organizationId: string }) => Promise<void>;  // ✅ Ensure organizationId is always string
  onUpdate: (deptId: string, data: Partial<DepartmentFormData>) => Promise<void>;
  onDelete: (deptId: string) => Promise<void>;
}

export const DepartmentList = ({
  departments,
  organizationId,
  organizationSlug,
  canManage,
  isLoading = false,
  onCreate,
  onUpdate,
  onDelete
}: DepartmentListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  // Filter departments by search term
  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate active and inactive departments
  const activeDepartments = filteredDepartments.filter(d => d.isActive);
  const inactiveDepartments = filteredDepartments.filter(d => !d.isActive);

  const handleCreate = async (data: DepartmentFormData) => {
    // ✅ Add organizationId to data before calling onCreate
    await onCreate({ ...data, organizationId });
  };

  const handleUpdate = async (data: DepartmentFormData) => {
    if (editingDepartment) {
      await onUpdate(editingDepartment.id, data);
      setEditingDepartment(null);
    }
  };

  const handleEdit = (dept: Department) => {
    setEditingDepartment(dept);
  };

  // Loading state
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
      {/* Header Actions */}
      <SettingsCard>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">จัดการหน่วยงาน</h3>
            <p className="text-sm text-gray-600">
              {departments.length} หน่วยงานทั้งหมด ({activeDepartments.length} ใช้งาน, {inactiveDepartments.length} ปิดใช้งาน)
            </p>
          </div>
          {canManage && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มหน่วยงานใหม่
            </Button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="ค้นหาหน่วยงาน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </SettingsCard>

      {/* Active Departments */}
      {activeDepartments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">หน่วยงานที่ใช้งาน</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeDepartments.map(dept => (
              <DepartmentCard
                key={dept.id}
                department={dept}
                canManage={canManage}
                onEdit={handleEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Departments */}
      {inactiveDepartments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-500">หน่วยงานที่ปิดใช้งาน</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactiveDepartments.map(dept => (
              <DepartmentCard
                key={dept.id}
                department={dept}
                canManage={canManage}
                onEdit={handleEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredDepartments.length === 0 && (
        <SettingsCard>
          <div className="py-12 text-center text-gray-600">
            {searchTerm ? 'ไม่พบหน่วยงานที่ตรงกับคำค้นหา' : 'ยังไม่มีหน่วยงาน'}
          </div>
        </SettingsCard>
      )}

      {/* Create Modal */}
      <DepartmentFormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        organizationId={organizationId}
        organizationSlug={organizationSlug}
        onSubmit={handleCreate}
      />

      {/* Edit Modal */}
      <DepartmentFormModal
        open={!!editingDepartment}
        onOpenChange={(open) => !open && setEditingDepartment(null)}
        organizationId={organizationId}
        organizationSlug={organizationSlug}
        department={editingDepartment || undefined}
        onSubmit={handleUpdate}
      />
    </div>
  );
};