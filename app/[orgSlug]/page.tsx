// FILE: app/[orgSlug]/page.tsx - UPDATED to pass Icon & Color
"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { OrganizationOverview } from '@/components/OrganizationDashboard';
import { type FrontendDepartment } from '@/lib/department-helpers';
import { transformAuditLogsToActivities, type AuditLog } from '@/lib/audit-helpers';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

import type { ActivityItem } from '@/components/OrganizationDashboard/RecentActivity';

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
  color: string;        // ✅ CRITICAL: Add color
  icon: string;         // ✅ CRITICAL: Add icon
  userRole: string;
  stats: OrganizationStats;
}

interface OrganizationPageData {
  organization: OrganizationData;
  departments: FrontendDepartment[];
  recentActivities: ActivityItem[];
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
        const orgResponse = await fetch(`/api/${orgSlug}`, {
          credentials: 'include',
        });

        if (!orgResponse.ok) {
          throw new Error(`Failed to load organization data: ${orgResponse.status}`);
        }

        const orgData = await orgResponse.json();
        
        if (!orgData.success) {
          throw new Error(orgData.error || 'Failed to load organization data');
        }

        // Load recent audit logs
        let recentActivities: ActivityItem[] = [];
        try {
          const auditResponse = await fetch(`/api/${orgSlug}/audit-logs?limit=20`, {
            credentials: 'include',
          });

          if (auditResponse.ok) {
            const auditData = await auditResponse.json();
            if (auditData.success && auditData.logs) {
              recentActivities = transformAuditLogsToActivities(auditData.logs as AuditLog[]);
              console.log(`✅ Loaded ${recentActivities.length} recent activities`);
            }
          } else {
            console.warn('Failed to load audit logs, showing empty activities');
          }
        } catch (auditError) {
          console.warn('Audit logs not available:', auditError);
        }

        const transformedDepartments: FrontendDepartment[] = orgData.departments;
        
        // ✅ UPDATED: Create organization object with color and icon from API
        const organization: OrganizationData = {
          id: orgData.organization.id,
          name: orgData.organization.name,
          slug: orgData.organization.slug,
          description: orgData.organization.description || `องค์กร ${orgData.organization.name}`,
          
          // ✅ CRITICAL: Get color and icon from API response
          color: orgData.organization.color || 'BLUE',
          icon: orgData.organization.icon || 'BUILDING',
          
          // Keep old logo for backward compatibility
          logo: orgData.organization.name.substring(0, 2).toUpperCase(),
          
          userRole: orgData.userRole || 'MEMBER',
          stats: {
            totalProducts: transformedDepartments.reduce((sum: number, dept: FrontendDepartment) => sum + dept.stockItems, 0),
            lowStockItems: transformedDepartments.reduce((sum: number, dept: FrontendDepartment) => sum + dept.lowStock, 0),
            pendingTransfers: 0,
            activeUsers: transformedDepartments.reduce((sum: number, dept: FrontendDepartment) => sum + dept.memberCount, 0),
            totalValue: '0',
            departments: transformedDepartments.length
          }
        };

        setPageData({
          organization,
          departments: transformedDepartments,
          recentActivities
        });

        console.log('✅ Organization page data loaded with color:', organization.color, 'and icon:', organization.icon);
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
        console.log('Selected department:', dept.name);
      }}
    />
  );
}