// app/[orgSlug]/[deptSlug]/transfers/create/page.tsx
// Create Transfer Page - Full Page (Not Modal)

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { CreateTransferForm } from '@/components/TransferManagement';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  code: string;
  name: string;
  genericName?: string;
  baseUnit: string;
}

export default function CreateTransferPage({
  params,
}: {
  params: Promise<{ orgSlug: string; deptSlug: string }>;
}) {
  const resolvedParams = use(params);
  const { orgSlug, deptSlug } = resolvedParams;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState('');
  const [requestingDepartment, setRequestingDepartment] = useState<Department | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

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

        setOrganizationId(userData.data.currentOrganization.id);

        const deptResponse = await fetch(`/api/${orgSlug}`);
        if (!deptResponse.ok) {
          throw new Error('Failed to load departments');
        }

        const deptData = await deptResponse.json();
        const currentDept = deptData.departments.find((d: Department) => d.slug === deptSlug);

        if (!currentDept) {
          setError('Department not found');
          return;
        }

        setRequestingDepartment(currentDept);
        setDepartments(deptData.departments);

        const productsResponse = await fetch(`/api/${orgSlug}/products`);
        if (!productsResponse.ok) {
          throw new Error('Failed to load products');
        }

        const productsData = await productsResponse.json();
        setProducts(productsData.data || []);
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
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-sm text-gray-500 mt-3">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error || !requestingDepartment) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="p-3 bg-red-100 rounded-full w-fit mx-auto">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mt-4">
              ไม่สามารถเข้าถึงได้
            </h2>
            <p className="text-sm text-gray-600 mt-2">{error || 'ไม่พบข้อมูล'}</p>
            <Button
              onClick={() => router.push(`/${orgSlug}/${deptSlug}/transfers`)}
              className="mt-6 w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับหน้าใบเบิก
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">สร้างใบเบิกใหม่</h1>
        <p className="text-sm text-gray-600 mt-1">
          หน่วยงาน: {requestingDepartment.name}
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <CreateTransferForm
            organizationId={organizationId}
            requestingDepartmentId={requestingDepartment.id}
            requestingDepartmentName={requestingDepartment.name}
            departments={departments}
            products={products}
            orgSlug={orgSlug}
            deptSlug={deptSlug}
          />
        </CardContent>
      </Card>
    </div>
  );
}