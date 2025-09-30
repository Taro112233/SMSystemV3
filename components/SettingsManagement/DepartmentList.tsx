// components/SettingsManagement/DepartmentList.tsx
// SettingsManagement/DepartmentList - Department CRUD interface

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Search, AlertTriangle } from 'lucide-react';

import { DepartmentCard } from './DepartmentCard';
import { DepartmentForm } from './DepartmentForm';

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
  userRole: 'MEMBER' | 'ADMIN' | 'OWNER';
  onCreate: (data: any) => Promise<void>;
  onUpdate: (deptId: string, data: any) => Promise<void>;
  onDelete: (deptId: string) => Promise<void>;
}

export const DepartmentList = ({
  departments,
  organizationId,
  userRole,
  onCreate,
  onUpdate,
  onDelete
}: DepartmentListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<any>(null);

  const canManage = ['ADMIN', 'OWNER'].includes(userRole);

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
      {/* Permission Alert */}
      {!canManage && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            คุณไม่มีสิทธิ์จัดการแผนก ต้องเป็น ADMIN หรือ OWNER เท่านั้น
          </AlertDescription>
        </Alert>
      )}

      {/* Header Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>จัดการแผนก</CardTitle>
              <CardDescription>
                {departments.length} แผนกทั้งหมด ({activeDepartments.length} ใช้งาน, {inactiveDepartments.length} ปิดใช้งาน)
              </CardDescription>
            </div>
            {canManage && !showCreateForm && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มแผนกใหม่
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Create Form */}
      {showCreateForm && canManage && (
        <Card>
          <CardHeader>
            <CardTitle>เพิ่มแผนกใหม่</CardTitle>
          </CardHeader>
          <CardContent>
            <DepartmentForm
              organizationId={organizationId}
              onSubmit={handleCreate}
              onCancel={() => setShowCreateForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      {editingDepartment && canManage && (
        <Card>
          <CardHeader>
            <CardTitle>แก้ไขแผนก: {editingDepartment.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <DepartmentForm
              organizationId={organizationId}
              department={editingDepartment}
              onSubmit={(data) => handleUpdate(editingDepartment.id, data)}
              onCancel={handleCancelEdit}
            />
          </CardContent>
        </Card>
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
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">
              {searchTerm ? 'ไม่พบแผนกที่ตรงกับคำค้นหา' : 'ยังไม่มีแผนก'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};