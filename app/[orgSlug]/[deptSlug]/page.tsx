// app/[orgSlug]/[deptSlug]/page.tsx - Updated Department Page (No Mock Data)
"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DepartmentView } from '@/components/DepartmentDashboard';
import { findDepartmentBySlug, transformDepartmentData, type FrontendDepartment } from '@/lib/department-helpers';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DepartmentPage() {
  const params = useParams();
  const orgSlug = params.orgSlug as string;
  const deptSlug = params.deptSlug as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departmentData, setDepartmentData] = useState<FrontendDepartment | null>(null);

  useEffect(() => {
    const loadDepartmentData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Loading department data for:', deptSlug);

        // Load departments from organization API
        const response = await fetch(`/api/${orgSlug}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to load organization data: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to load organization data');
        }

        // Transform departments and find the specific one
        const transformedDepartments = data.departments.map(transformDepartmentData);
        const foundDepartment = findDepartmentBySlug(transformedDepartments, deptSlug);

        if (!foundDepartment) {
          setError(`ไม่พบหน่วยงาน: ${deptSlug}`);
          setLoading(false);
          return;
        }

        setDepartmentData(foundDepartment);
        console.log('✅ Department data loaded:', foundDepartment.name);
        setLoading(false);

      } catch (err) {
        console.error('❌ Failed to load department data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load department data');
        setLoading(false);
      }
    };

    if (orgSlug && deptSlug) {
      loadDepartmentData();
    }
  }, [orgSlug, deptSlug]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
          <p className="text-gray-600">กำลังโหลดข้อมูลหน่วยงาน...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !departmentData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">ไม่พบข้อมูลหน่วยงาน</h2>
        <p className="text-gray-600 mb-4">{error || `ไม่พบหน่วยงาน: ${deptSlug}`}</p>
        <Button onClick={() => window.history.back()}>
          กลับไปหน้าก่อนหน้า
        </Button>
      </div>
    );
  }

  return <DepartmentView department={departmentData} />;
}