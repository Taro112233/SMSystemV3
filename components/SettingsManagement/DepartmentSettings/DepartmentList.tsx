// FILE: components/SettingsManagement/DepartmentSettings/DepartmentList.tsx
// DepartmentSettings/DepartmentList - List/grid view
// ============================================

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { SettingsCard } from '../shared/SettingsCard';
import { DepartmentCard } from './DepartmentCard';
import { DepartmentForm } from './DepartmentForm';
import { SettingsSection } from '../shared/SettingsSection';

interface DepartmentListProps {
  departments: Array<{
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
  }>;
  organizationId: string;
  canManage: boolean;
  onCreate: (data: any) => Promise<void>;
  onUpdate: (deptId: string, data: any) => Promise<void>;
  onDelete: (deptId: string) => Promise<void>;
}

export const DepartmentList = ({
  departments,
  organizationId,
  canManage,
  onCreate,
  onUpdate,
  onDelete
}: DepartmentListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<any>(null);

  // Filter departments by search term
  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate active and inactive departments
  const activeDepartments = filteredDepartments.filter(d => d.isActive);
  const inactiveDepartments = filteredDepartments.filter(d => !d.isActive);

  const handleCreate = async (data: any) => {
    await onCreate(data);
    setShowCreateForm(false);
  };

  const handleUpdate = async (deptId: string, data: any) => {
    await onUpdate(deptId, data);
    setEditingDepartment(null);
  };

  const handleEdit = (dept: any) => {
    setEditingDepartment(dept);
  };

  const handleCancelEdit = () => {
    setEditingDepartment(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <SettingsCard>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">จัดการแผนก</h3>
            <p className="text-sm text-gray-600">
              {departments.length} แผนกทั้งหมด ({activeDepartments.length} ใช้งาน, {inactiveDepartments.length} ปิดใช้งาน)
            </p>
          </div>
          {canManage && !showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มแผนกใหม่
            </Button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="ค้นหาแผนก..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </SettingsCard>

      {/* Create Form */}
      {showCreateForm && canManage && (
        <SettingsSection title="เพิ่มแผนกใหม่">
          <DepartmentForm
            organizationId={organizationId}
            onSubmit={handleCreate}
            onCancel={() => setShowCreateForm(false)}
          />
        </SettingsSection>
      )}

      {/* Edit Form */}
      {editingDepartment && canManage && (
        <SettingsSection title={`แก้ไขแผนก: ${editingDepartment.name}`}>
          <DepartmentForm
            organizationId={organizationId}
            department={editingDepartment}
            onSubmit={(data) => handleUpdate(editingDepartment.id, data)}
            onCancel={handleCancelEdit}
          />
        </SettingsSection>
      )}

      {/* Active Departments */}
      {activeDepartments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">แผนกที่ใช้งาน</h3>
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
          <h3 className="text-lg font-semibold text-gray-500">แผนกที่ปิดใช้งาน</h3>
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
            {searchTerm ? 'ไม่พบแผนกที่ตรงกับคำค้นหา' : 'ยังไม่มีแผนก'}
          </div>
        </SettingsCard>
      )}
    </div>
  );
};