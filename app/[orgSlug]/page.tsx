// app/[orgSlug]/page.tsx - Updated Organization Page (Real Data Only) - FIXED TYPES
"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { OrganizationOverview } from '@/components/OrganizationDashboard';
import { transformDepartmentData, type FrontendDepartment } from '@/lib/department-helpers';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ✅ FIXED: Define proper types matching OrganizationOverview component
interface OrganizationStats {
  totalProducts: number;
  lowStockItems: number;
  pendingTransfers: number;
  activeUsers: number;
  totalValue: string;
  departments: number;
}

interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  color: string;
  userRole: string;
  stats: OrganizationStats;
}

// ✅ FIXED: Match EXACT Activity interface from OrganizationOverview component
interface Activity {
  id: string;
  type: string;           // ✅ Required field
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  status: 'success' | 'warning' | 'info' | 'error';
  user?: string;
}

interface OrganizationPageData {
  organization: OrganizationData;
  departments: FrontendDepartment[];
  recentActivities: Activity[]; // ✅ FIXED: Use Activity type
}

export default function OrganizationPage() {
  const params = useParams();
  const orgSlug = params.orgSlug as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageData, setPageData] = useState<OrganizationPageData | null>(null);

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Loading organization page data for:', orgSlug);

        // Load organization and departments data
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

        // Transform departments for frontend with proper typing
        const transformedDepartments: FrontendDepartment[] = data.departments.map(transformDepartmentData);
        
        // Create organization object with calculated stats (proper typing)
        const organization: OrganizationData = {
          id: data.organization.id,
          name: data.organization.name,
          slug: data.organization.slug,
          description: data.organization.description || `องค์กร ${data.organization.name}`,
          logo: data.organization.name.substring(0, 2).toUpperCase(),
          color: 'bg-blue-500',
          userRole: data.userRole || 'MEMBER',
          stats: {
            totalProducts: transformedDepartments.reduce((sum: number, dept: FrontendDepartment) => sum + dept.stockItems, 0),
            lowStockItems: transformedDepartments.reduce((sum: number, dept: FrontendDepartment) => sum + dept.lowStock, 0),
            pendingTransfers: 0, // Will be calculated from real transfers API later
            activeUsers: transformedDepartments.reduce((sum: number, dept: FrontendDepartment) => sum + dept.memberCount, 0),
            totalValue: '0', // Will be calculated from real stock values later
            departments: transformedDepartments.length
          }
        };

        // Empty recent activities array - will be populated from audit log API later
        const recentActivities: Activity[] = [];

        setPageData({
          organization,
          departments: transformedDepartments,
          recentActivities
        });

        console.log('✅ Organization page data loaded');
        setLoading(false);

      } catch (err) {
        console.error('❌ Failed to load organization page data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load organization data');
        setLoading(false);
      }
    };

    if (orgSlug) {
      loadPageData();
    }
  }, [orgSlug]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
          <p className="text-gray-600">กำลังโหลดข้อมูลองค์กร...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !pageData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">เกิดข้อผิดพลาด</h2>
        <p className="text-gray-600 mb-4">{error || 'ไม่สามารถโหลดข้อมูลได้'}</p>
        <Button onClick={() => window.location.reload()}>
          ลองใหม่
        </Button>
      </div>
    );
  }

  return (
    <OrganizationOverview
      organization={pageData.organization}
      departments={pageData.departments}
      recentActivities={pageData.recentActivities}
      onSelectDepartment={(dept) => {
        // Navigation handled by router.push in parent
        console.log('Selected department:', dept.name);
      }}
    />
  );
}