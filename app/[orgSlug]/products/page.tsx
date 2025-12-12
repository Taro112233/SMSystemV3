// app/[orgSlug]/products/page.tsx
// Products Page - Use ProductsManagement2

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductsManagement2 from '@/components/ProductsManagement2';
import { Loader2, AlertCircle } from 'lucide-react';

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
          <p className="text-sm text-gray-500 mt-2">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (error || !organizationData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="p-3 bg-red-100 rounded-full w-fit mx-auto">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mt-3">
            ไม่สามารถเข้าถึงได้
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {error || 'คุณไม่มีสิทธิ์เข้าถึงองค์กรนี้'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProductsManagement2
      orgSlug={orgSlug}
      userRole={organizationData.userRole}
    />
  );
}