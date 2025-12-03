// app/[orgSlug]/[deptSlug]/transfers/page.tsx
// Department Transfers Page - UPDATED: Show both outgoing and incoming in single view

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { DepartmentTransfersView } from '@/components/TransferManagement';
import { Loader2, AlertCircle } from 'lucide-react';

interface DepartmentData {
  id: string;
  name: string;
  slug: string;
}

interface OrganizationData {
  id: string;
  name: string;
  slug: string;
}

export default function DepartmentTransfersPage({
  params,
}: {
  params: Promise<{ orgSlug: string; deptSlug: string }>;
}) {
  const resolvedParams = use(params);
  const { orgSlug, deptSlug } = resolvedParams;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null);
  const [departmentData, setDepartmentData] = useState<DepartmentData | null>(null);

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);
        setError(null);

        const userResponse = await fetch(`/api/auth/me?orgSlug=${orgSlug}`);

        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to load user data');
        }

        const userData = await userResponse.json();

        if (!userData.data.currentOrganization || userData.data.currentOrganization.slug !== orgSlug) {
          setError('No access to this organization');
          return;
        }

        setOrganizationData(userData.data.currentOrganization);

        const deptResponse = await fetch(`/api/${orgSlug}`);
        if (!deptResponse.ok) {
          throw new Error('Failed to load departments');
        }

        const deptData = await deptResponse.json();
        const department = deptData.departments.find((d: DepartmentData) => d.slug === deptSlug);

        if (!department) {
          setError('Department not found');
          return;
        }

        setDepartmentData(department);
      } catch (err) {
        console.error('Error loading page data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load page data');
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, [orgSlug, deptSlug, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-sm text-gray-500 mt-3">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error || !organizationData || !departmentData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="p-3 bg-red-100 rounded-full w-fit mx-auto">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mt-4">
            ไม่สามารถเข้าถึงได้
          </h2>
          <p className="text-sm text-gray-600 mt-2">{error || 'ไม่พบข้อมูล'}</p>
          <button
            onClick={() => router.push(`/${orgSlug}`)}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return (
    <DepartmentTransfersView
      departmentId={departmentData.id}
      departmentSlug={departmentData.slug}
      departmentName={departmentData.name}
      organizationId={organizationData.id}
      orgSlug={orgSlug}
    />
  );
}