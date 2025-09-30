// app/[orgSlug]/settings/page.tsx
// Organization Settings Page - Main orchestrator

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertTriangle, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Import settings components
import { SettingsManagement } from '@/components/SettingsManagement';

interface UserData {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
}

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

interface DepartmentData {
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

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params.orgSlug as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [organization, setOrganization] = useState<OrganizationData | null>(null);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Load settings data
  useEffect(() => {
    loadSettingsData();
  }, [orgSlug]);

  const loadSettingsData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Loading settings data for:', orgSlug);

      // Get user and organization data
      const userResponse = await fetch(`/api/auth/me?orgSlug=${orgSlug}`, {
        credentials: 'include',
      });

      if (!userResponse.ok) {
        if (userResponse.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(`Failed to load user data: ${userResponse.status}`);
      }

      const userData = await userResponse.json();

      if (!userData.success) {
        throw new Error(userData.error || 'Failed to load user data');
      }

      // Check access
      if (!userData.data.currentOrganization || userData.data.currentOrganization.slug !== orgSlug) {
        setError('No access to this organization');
        return;
      }

      // Check if user has settings access (ADMIN or OWNER only)
      const role = userData.data.permissions.currentRole;
      if (!['ADMIN', 'OWNER'].includes(role)) {
        setError('Insufficient permissions. Only ADMIN or OWNER can access settings.');
        return;
      }

      setUser(userData.data.user);
      setOrganization(userData.data.currentOrganization);
      setUserRole(role);

      // Load departments
      const deptResponse = await fetch(`/api/${orgSlug}`, {
        credentials: 'include',
      });

      if (!deptResponse.ok) {
        throw new Error('Failed to load departments');
      }

      const deptData = await deptResponse.json();
      
      if (deptData.success) {
        // Transform departments from frontend format back to database format
        const transformedDepts = deptData.departments.map((dept: any) => ({
          id: dept.id,
          name: dept.name,
          slug: dept.slug,
          description: dept.description,
          color: dept.color ? dept.color.replace('bg-', '').replace('-500', '').toUpperCase() : null,
          icon: dept.icon,
          isActive: dept.isActive,
          parentId: dept.parentId,
          createdAt: new Date(dept.createdAt),
          updatedAt: new Date(dept.updatedAt)
        }));
        setDepartments(transformedDepts);
      }

      console.log('✅ Settings data loaded');
      setLoading(false);

    } catch (err) {
      console.error('❌ Failed to load settings data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
      setLoading(false);
    }
  };

  // Callback for organization update
  const handleOrganizationUpdate = async (updatedOrg: Partial<OrganizationData>) => {
    try {
      const response = await fetch(`/api/${orgSlug}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedOrg)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update organization');
      }

      const data = await response.json();
      
      if (data.success) {
        setOrganization(data.organization);
        toast.success('อัพเดทข้อมูลองค์กรสำเร็จ');
        
        // If slug changed, redirect to new URL
        if (updatedOrg.slug && updatedOrg.slug !== orgSlug) {
          toast.info('กำลังเปลี่ยนเส้นทาง...', {
            description: 'URL ขององค์กรได้รับการเปลี่ยนแปลง'
          });
          setTimeout(() => {
            router.push(`/${updatedOrg.slug}/settings`);
          }, 1500);
        }
      }

      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update';
      toast.error('ไม่สามารถอัพเดทได้', { description: errorMsg });
      throw err;
    }
  };

  // Callback for department operations
  const handleDepartmentCreate = async (deptData: any) => {
    await loadSettingsData();
  };

  const handleDepartmentUpdate = async (deptId: string, deptData: any) => {
    await loadSettingsData();
  };

  const handleDepartmentDelete = async (deptId: string) => {
    await loadSettingsData();
  };

  // Loading state
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

  // Error state
  if (error || !user || !organization) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">ไม่สามารถเข้าถึงได้</h2>
        <p className="text-gray-600 mb-4">{error || 'ไม่พบข้อมูล'}</p>
        <Button onClick={() => router.push(`/${orgSlug}`)}>
          กลับไปหน้าองค์กร
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ตั้งค่าองค์กร
          </h1>
          <p className="text-gray-600">
            จัดการข้อมูลองค์กรและแผนก
          </p>
        </div>
      </div>

      {/* Settings Management Component */}
      <SettingsManagement
        organization={organization}
        departments={departments}
        userRole={userRole as 'MEMBER' | 'ADMIN' | 'OWNER'}
        onOrganizationUpdate={handleOrganizationUpdate}
        onDepartmentCreate={handleDepartmentCreate}
        onDepartmentUpdate={handleDepartmentUpdate}
        onDepartmentDelete={handleDepartmentDelete}
      />
    </div>
  );
}