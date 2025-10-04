// FILE: app/[orgSlug]/settings/page.tsx - FIXED LINT ERRORS
// Settings Page - UPDATED to use /departments API

"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SettingsManagement } from '@/components/SettingsManagement';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// ✅ FIXED: Define proper types
interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  email?: string;
  phone?: string;
  timezone: string;
  inviteCode?: string;
  inviteEnabled?: boolean;
  status: string;
}

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

interface UpdateOrgData {
  name?: string;
  slug?: string;
  description?: string;
  email?: string;
  phone?: string;
  timezone?: string;
  inviteCode?: string;
  inviteEnabled?: boolean;
}

interface CreateDepartmentData {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

// ✅ FIXED: Make UpdateDepartmentData match expected Partial type
interface UpdateDepartmentData {
  name?: string;
  slug?: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
  organizationId?: string;
}

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params.orgSlug as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [userRole, setUserRole] = useState<'MEMBER' | 'ADMIN' | 'OWNER' | null>(null);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);

  // ✅ FIXED: Wrap loadDepartments with useCallback
  const loadDepartments = useCallback(async () => {
    try {
      setIsLoadingDepartments(true);
      
      const deptResponse = await fetch(`/api/${orgSlug}/departments`, {
        credentials: 'include',
      });

      if (!deptResponse.ok) {
        throw new Error('Failed to load departments');
      }

      const deptData = await deptResponse.json();

      if (!deptData.success) {
        throw new Error(deptData.error || 'Failed to load departments');
      }

      setDepartments(deptData.departments);
      
      console.log(`✅ Loaded ${deptData.departments.length} departments (${deptData.stats?.active || 0} active, ${deptData.stats?.inactive || 0} inactive)`);
      
    } catch (err) {
      console.error('Failed to load departments:', err);
      toast.error('ไม่สามารถโหลดข้อมูลหน่วยงานได้');
    } finally {
      setIsLoadingDepartments(false);
    }
  }, [orgSlug]);

  useEffect(() => {
    const loadSettingsData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Loading settings data for:', orgSlug);

        // Get user and organization context
        const userResponse = await fetch(`/api/auth/me?orgSlug=${orgSlug}`, {
          credentials: 'include',
        });

        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to load user data');
        }

        const userData = await userResponse.json();

        if (!userData.success) {
          throw new Error(userData.error || 'Failed to load user data');
        }

        // Check organization access
        if (!userData.data.currentOrganization || userData.data.currentOrganization.slug !== orgSlug) {
          setError('No access to this organization');
          setLoading(false);
          return;
        }

        setUserRole(userData.data.permissions.currentRole);

        // Load organization details
        const orgResponse = await fetch(`/api/${orgSlug}/settings`, {
          credentials: 'include',
        });

        if (!orgResponse.ok) {
          throw new Error('Failed to load organization settings');
        }

        const orgData = await orgResponse.json();

        if (!orgData.success) {
          throw new Error(orgData.error || 'Failed to load settings');
        }

        setOrganizationData(orgData.organization);

        // Load departments
        await loadDepartments();

        console.log('✅ Settings data loaded successfully');
        setLoading(false);

      } catch (err) {
        console.error('❌ Failed to load settings data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load settings');
        setLoading(false);
      }
    };

    if (orgSlug) {
      loadSettingsData();
    }
  }, [orgSlug, router, loadDepartments]); // ✅ FIXED: Include loadDepartments dependency

  // ✅ FIXED: Type the data parameter
  const handleOrganizationUpdate = async (data: UpdateOrgData) => {
    try {
      const response = await fetch(`/api/${orgSlug}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update organization');
      }

      const result = await response.json();
      
      // Update local state
      setOrganizationData(result.organization);
      
      toast.success('อัพเดทข้อมูลองค์กรสำเร็จ');
      return result;
    } catch (error) {
      toast.error('ไม่สามารถอัพเดทข้อมูลได้');
      throw error;
    }
  };

  // ✅ FIXED: Type the data parameter
  const handleDepartmentCreate = async (data: CreateDepartmentData) => {
    try {
      const response = await fetch(`/api/${orgSlug}/departments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create department');
      }

      // Reload departments after create
      await loadDepartments();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
      toast.error('ไม่สามารถสร้างหน่วยงานได้', {
        description: errorMsg
      });
      throw error;
    }
  };

  // ✅ FIXED: Type the data parameter
  const handleDepartmentUpdate = async (deptId: string, data: UpdateDepartmentData) => {
    try {
      const response = await fetch(`/api/${orgSlug}/departments/${deptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update department');
      }

      // Reload departments after update
      await loadDepartments();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
      toast.error('ไม่สามารถอัพเดทหน่วยงานได้', {
        description: errorMsg
      });
      throw error;
    }
  };

  const handleDepartmentDelete = async (deptId: string) => {
    try {
      const response = await fetch(`/api/${orgSlug}/departments/${deptId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete department');
      }

      // Reload departments after delete
      await loadDepartments();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
      toast.error('ไม่สามารถลบหน่วยงานได้', {
        description: errorMsg
      });
      throw error;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
          <p className="text-gray-600">กำลังโหลดการตั้งค่า...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !organizationData || !userRole) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">เกิดข้อผิดพลาด</h2>
        <p className="text-gray-600 mb-4">{error || 'ไม่สามารถโหลดการตั้งค่าได้'}</p>
        <Button onClick={() => window.location.reload()}>
          ลองใหม่
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">การตั้งค่า</h1>
        <p className="text-gray-600 mt-2">
          จัดการข้อมูลองค์กร หน่วยงาน และสมาชิก
        </p>
      </div>

      <SettingsManagement
        organization={organizationData}
        departments={departments}
        userRole={userRole}
        isLoadingDepartments={isLoadingDepartments}
        onOrganizationUpdate={handleOrganizationUpdate}
        onDepartmentCreate={handleDepartmentCreate}
        onDepartmentUpdate={handleDepartmentUpdate}
        onDepartmentDelete={handleDepartmentDelete}
      />
    </div>
  );
}