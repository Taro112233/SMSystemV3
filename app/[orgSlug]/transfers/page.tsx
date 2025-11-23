// app/[orgSlug]/transfers/page.tsx
// Organization Transfers Page

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { OrganizationTransfersView } from '@/components/TransferManagement';
import { Loader2, AlertCircle } from 'lucide-react';

interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  userRole: string;
}

export default function OrganizationTransfersPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const resolvedParams = use(params);
  const orgSlug = resolvedParams.orgSlug;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null);

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/auth/me?orgSlug=${orgSlug}`);

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to load user data');
        }

        const data = await response.json();

        if (!data.data.currentOrganization || data.data.currentOrganization.slug !== orgSlug) {
          setError('No access to this organization');
          return;
        }

        // Check permission (ADMIN+ only)
        const userRole = data.data.currentOrganization.userRole;
        if (!['ADMIN', 'OWNER'].includes(userRole)) {
          setError('Insufficient permissions');
          return;
        }

        setOrganizationData(data.data.currentOrganization);
      } catch (err) {
        console.error('Error loading page data:', err);
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
          <p className="text-sm text-gray-500 mt-3">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error || !organizationData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="p-3 bg-red-100 rounded-full w-fit mx-auto">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mt-4">
            ไม่สามารถเข้าถึงได้
          </h2>
          <p className="text-sm text-gray-600 mt-2">{error || 'คุณไม่มีสิทธิ์เข้าถึง'}</p>
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

  return (
    <OrganizationTransfersView
      organizationId={organizationData.id}
      orgSlug={orgSlug}
    />
  );
}