// app/[orgSlug]/products/page.tsx
// Products Management Page - Organization-level product management

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductsManagement from '@/components/ProductsManagement';
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

export default function ProductsPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params.orgSlug as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null);

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

        console.log('🔍 Organization Data:', {
          organizationName: data.data.currentOrganization.name,
          userRole: data.data.currentOrganization.userRole,
          permissions: data.data.permissions,
        });
      } catch (err) {
        console.error('❌ Error loading page data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load page data');
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, [orgSlug, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-sm text-gray-500 mt-3">กำลังโหลดข้อมูลสินค้า...</p>
        </div>
      </div>
    );
  }

  if (error || !user || !organizationData) {
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
            {error || 'คุณไม่มีสิทธิ์เข้าถึงองค์กรนี้'}
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  console.log('🔍 Passing to ProductsManagement:', {
    orgSlug: orgSlug,
    userRole: organizationData.userRole,
    userRoleType: typeof organizationData.userRole,
  });

  return (
    <div className="space-y-6">
      {organizationData.userRole ? (
        <ProductsManagement
          orgSlug={orgSlug}
          userRole={organizationData.userRole}
        />
      ) : (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            ⚠️ ไม่พบข้อมูล Role ของผู้ใช้ กรุณาติดต่อผู้ดูแลระบบ
          </p>
          <pre className="mt-2 text-xs">
            {JSON.stringify(organizationData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}