// app/[orgSlug]/products/categories/page.tsx
// Page component - FIXED imports
// ============================================

"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductCategorySettings } from '@/components/SettingsManagement/ProductCategorySettings';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { 
  ProductAttributeCategory,
  CreateCategoryData,
  UpdateCategoryData 
} from '@/types/product-category';  // ✅ Import from shared types

export default function ProductCategoriesPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params.orgSlug as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<ProductAttributeCategory[]>([]);
  const [userRole, setUserRole] = useState<'MEMBER' | 'ADMIN' | 'OWNER' | null>(null);
  const [organizationId, setOrganizationId] = useState<string>('');
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      setIsLoadingCategories(true);
      
      const response = await fetch(`/api/${orgSlug}/product-categories`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load categories');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load categories');
      }

      setCategories(data.categories);
      
      console.log(`✅ Loaded ${data.categories.length} categories (${data.stats?.active || 0} active, ${data.stats?.inactive || 0} inactive)`);
      
    } catch (err) {
      console.error('Failed to load categories:', err);
      toast.error('ไม่สามารถโหลดข้อมูลหมวดหมู่ได้');
    } finally {
      setIsLoadingCategories(false);
    }
  }, [orgSlug]);

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Loading categories page for:', orgSlug);

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

        if (!userData.data.currentOrganization || userData.data.currentOrganization.slug !== orgSlug) {
          setError('No access to this organization');
          setLoading(false);
          return;
        }

        setUserRole(userData.data.permissions.currentRole);
        setOrganizationId(userData.data.currentOrganization.id);

        await loadCategories();

        console.log('✅ Categories page data loaded');
        setLoading(false);

      } catch (err) {
        console.error('❌ Failed to load categories page:', err);
        setError(err instanceof Error ? err.message : 'Failed to load categories');
        setLoading(false);
      }
    };

    if (orgSlug) {
      loadPageData();
    }
  }, [orgSlug, router, loadCategories]);

  const handleCategoryCreate = async (data: CreateCategoryData) => {
    try {
      const response = await fetch(`/api/${orgSlug}/product-categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create category');
      }

      await loadCategories();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
      toast.error('ไม่สามารถสร้างหมวดหมู่ได้', {
        description: errorMsg
      });
      throw error;
    }
  };

  const handleCategoryUpdate = async (categoryId: string, data: UpdateCategoryData) => {
    try {
      const response = await fetch(`/api/${orgSlug}/product-categories/${categoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update category');
      }

      await loadCategories();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
      toast.error('ไม่สามารถอัพเดทหมวดหมู่ได้', {
        description: errorMsg
      });
      throw error;
    }
  };

  const handleCategoryDelete = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/${orgSlug}/product-categories/${categoryId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }

      await loadCategories();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
      toast.error('ไม่สามารถลบหมวดหมู่ได้', {
        description: errorMsg
      });
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
          <p className="text-gray-600">กำลังโหลดหมวดหมู่สินค้า...</p>
        </div>
      </div>
    );
  }

  if (error || !userRole || !organizationId) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">เกิดข้อผิดพลาด</h2>
        <p className="text-gray-600 mb-4">{error || 'ไม่สามารถโหลดหมวดหมู่ได้'}</p>
        <Button onClick={() => window.location.reload()}>
          ลองใหม่
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">จัดการหมวดหมู่สินค้า</h1>
        <p className="text-gray-600 mt-2">
          สร้างและจัดการหมวดหมู่คุณสมบัติสินค้าสำหรับการจัดประเภท
        </p>
      </div>

      <ProductCategorySettings
        categories={categories}
        organizationId={organizationId}
        organizationSlug={orgSlug}
        userRole={userRole}
        isLoading={isLoadingCategories}
        onCreate={handleCategoryCreate}
        onUpdate={handleCategoryUpdate}
        onDelete={handleCategoryDelete}
      />
    </div>
  );
}