// app/[orgSlug]/[deptSlug]/transfers/[transferId]/page.tsx
// Transfer Detail Page - UPDATED: Use TransferDetailView (without "2")

'use client';

import { use, useEffect, useState } from 'react';
import { TransferDetailView } from '@/components/TransferManagement';
import { Loader2 } from 'lucide-react';

export default function TransferDetailPage({
  params,
}: {
  params: Promise<{ orgSlug: string; deptSlug: string; transferId: string }>;
}) {
  const resolvedParams = use(params);
  const { orgSlug, deptSlug, transferId } = resolvedParams;

  const [loading, setLoading] = useState(true);
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartmentId = async () => {
      try {
        setLoading(true);

        const response = await fetch(`/api/${orgSlug}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch departments');
        }

        const data = await response.json();

        if (data.success && data.departments) {
          const department = data.departments.find(
            (d: { slug: string }) => d.slug === deptSlug
          );

          if (department) {
            setDepartmentId(department.id);
          } else {
            setError('Department not found');
          }
        }
      } catch (err) {
        console.error('Error fetching department:', err);
        setError('Failed to load department');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentId();
  }, [orgSlug, deptSlug]);

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

  if (error || !departmentId) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'ไม่พบข้อมูลแผนก'}</p>
      </div>
    );
  }

  return (
    <TransferDetailView
      transferId={transferId}
      orgSlug={orgSlug}
      userDepartmentId={departmentId}
    />
  );
}