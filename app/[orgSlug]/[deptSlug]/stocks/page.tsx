// app/[orgSlug]/[deptSlug]/stocks/page.tsx
// Department Stocks Page - Department-specific stock management

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DepartmentStocksManagement from '@/components/DepartmentStocksManagement';
import { Loader2, AlertCircle } from 'lucide-react';

interface UserData {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email?: string;
}

interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  userRole: string;
}

interface DepartmentData {
  id: string;
  name: string;
  slug: string;
}

interface DepartmentResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

export default function DepartmentStocksPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params.orgSlug as string;
  const deptSlug = params.deptSlug as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null);
  const [departmentData, setDepartmentData] = useState<DepartmentData | null>(null);

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Fetching user data from /api/auth/me...');
        const response = await fetch(`/api/auth/me?orgSlug=${orgSlug}`);

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to load user data');
        }

        const data = await response.json();
        console.log('✅ API Response:', data);

        if (!data.data.currentOrganization || data.data.currentOrganization.slug !== orgSlug) {
          setError('No access to this organization');
          return;
        }

        setUser(data.data.user);
        setOrganizationData(data.data.currentOrganization);

        // Fetch department data
        console.log('🔍 Fetching department data...');
        const deptResponse = await fetch(`/api/${orgSlug}`);
        if (!deptResponse.ok) {
          throw new Error('Failed to load department data');
        }

        const deptData = await deptResponse.json();
        const department = deptData.departments?.find((d: DepartmentResponse) => d.slug === deptSlug);
        
        if (!department) {
          setError('Department not found');
          return;
        }

        setDepartmentData(department);

        console.log('✅ Department found:', department.name);
      } catch (err) {
        console.error('❌ Error loading page data:', err);
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
          <p className="text-sm text-gray-500 mt-3">กำลังโหลดข้อมูลสต็อก...</p>
        </div>
      </div>
    );
  }

  if (error || !user || !organizationData || !departmentData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="p-3 bg-red-100 rounded-full w-fit mx-auto">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mt-4">
            ไม่สามารถเข้าถึงได้
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {error || 'คุณไม่มีสิทธิ์เข้าถึงหน่วยงานนี้'}
          </p>
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
    <div className="space-y-6">
      {organizationData.userRole ? (
        <DepartmentStocksManagement
          orgSlug={orgSlug}
          deptSlug={deptSlug}
          departmentName={departmentData.name}
          userRole={organizationData.userRole}
        />
      ) : (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            ⚠️ ไม่พบข้อมูล Role ของผู้ใช้ กรุณาติดต่อผู้ดูแลระบบ
          </p>
        </div>
      )}
    </div>
  );
}