// app/[orgSlug]/settings/units/page.tsx
// Product Units Settings Page (SIMPLIFIED)
// ============================================

"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { ProductUnitSettings } from '@/components/SettingsManagement/ProductUnitSettings';
import type { ProductUnit, UnitFormData } from '@/types/product-unit';

interface OrganizationData {
  currentOrganization: {
    id: string;
    name: string;
    slug: string;
  };
  permissions: {
    currentRole: 'MEMBER' | 'ADMIN' | 'OWNER';
  };
}

export default function ProductUnitsSettingsPage() {
  const params = useParams();
  const orgSlug = params.orgSlug as string;

  const [units, setUnits] = useState<ProductUnit[]>([]);
  const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load organization data and units
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Get organization data
        const orgResponse = await fetch(`/api/auth/me?orgSlug=${orgSlug}`, {
          credentials: 'include',
        });

        if (!orgResponse.ok) {
          throw new Error('Failed to load organization data');
        }

        const orgData = await orgResponse.json();
        setOrganizationData(orgData.data);

        // Load product units
        const unitsResponse = await fetch(`/api/${orgSlug}/product-units`, {
          credentials: 'include',
        });

        if (!unitsResponse.ok) {
          throw new Error('Failed to load product units');
        }

        const unitsData = await unitsResponse.json();
        setUnits(unitsData.units || []);

      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('ไม่สามารถโหลดข้อมูลได้', {
          description: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (orgSlug) {
      loadData();
    }
  }, [orgSlug]);

  const handleCreateUnit = async (data: UnitFormData & { organizationId: string }) => {
    try {
      const response = await fetch(`/api/${orgSlug}/product-units`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create unit');
      }

      const result = await response.json();
      setUnits(prev => [...prev, result.unit]);
      
      toast.success('สร้างหน่วยนับสำเร็จ');
    } catch (error) {
      console.error('Create unit failed:', error);
      throw error;
    }
  };

  const handleUpdateUnit = async (unitId: string, data: Partial<UnitFormData>) => {
    try {
      const response = await fetch(`/api/${orgSlug}/product-units/${unitId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update unit');
      }

      const result = await response.json();
      setUnits(prev => prev.map(unit => 
        unit.id === unitId ? result.unit : unit
      ));
      
      toast.success('อัพเดทหน่วยนับสำเร็จ');
    } catch (error) {
      console.error('Update unit failed:', error);
      throw error;
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    try {
      const response = await fetch(`/api/${orgSlug}/product-units/${unitId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete unit');
      }

      setUnits(prev => prev.filter(unit => unit.id !== unitId));
      
      toast.success('ลบหน่วยนับสำเร็จ');
    } catch (error) {
      console.error('Delete unit failed:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ตั้งค่าหน่วยนับ</h1>
          <p className="text-gray-600 mt-2">
            จัดการหน่วยนับสินค้าและอัตราส่วนการแปลง
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
        </div>
      </div>
    );
  }

  if (!organizationData || !organizationData.currentOrganization) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="text-center py-12">
          <p className="text-gray-600">ไม่สามารถเข้าถึงข้อมูลองค์กรได้</p>
        </div>
      </div>
    );
  }

  const userRole = organizationData.permissions.currentRole;

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ตั้งค่าหน่วยนับ</h1>
        <p className="text-gray-600 mt-2">
          จัดการหน่วยนับสินค้าและอัตราส่วนการแปลง สำหรับการคำนวณสต็อก
        </p>
      </div>

      <ProductUnitSettings
        units={units}
        organizationId={organizationData.currentOrganization.id}
        organizationSlug={orgSlug}
        userRole={userRole}
        isLoading={false}
        onCreate={handleCreateUnit}
        onUpdate={handleUpdateUnit}
        onDelete={handleDeleteUnit}
      />
    </div>
  );
}