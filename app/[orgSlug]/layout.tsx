// FILE: app/[orgSlug]/layout.tsx - FINAL FIX for Icon & Color
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertTriangle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { DashboardSidebar } from '@/components/OrganizationLayout';
import { DashboardHeader } from '@/components/OrganizationLayout/OrganizationHeader';
import { findDepartmentBySlug, type FrontendDepartment } from '@/lib/department-helpers';

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
  description?: string;
  color: string | null;      // ✅ Receive from API (nullable)
  icon: string | null;       // ✅ Receive from API (nullable)
  role: string;
}

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const orgSlug = params.orgSlug as string;
  const deptSlug = params.deptSlug as string;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null);
  const [departments, setDepartments] = useState<FrontendDepartment[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<FrontendDepartment | null>(null);
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadOrganizationData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Loading organization layout data for:', orgSlug);

        const userResponse = await fetch(`/api/auth/me?orgSlug=${orgSlug}`, {
          credentials: 'include',
        });

        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            console.log('❌ Unauthorized, redirecting to login');
            router.push('/login');
            return;
          }
          throw new Error(`Failed to load user data: ${userResponse.status}`);
        }

        const userData = await userResponse.json();

        if (!userData.success) {
          throw new Error(userData.error || 'Failed to load user data');
        }

        console.log('✅ User data loaded:', userData.data.user.username);
        console.log('✅ Current organization:', userData.data.currentOrganization?.name);

        if (!userData.data.currentOrganization || userData.data.currentOrganization.slug !== orgSlug) {
          console.log('❌ No access to organization:', orgSlug);
          setError('No access to this organization');
          setLoading(false);
          return;
        }

        // ✅ CRITICAL: Log received data from API
        console.log('🎨 Layout - Received from API:', {
          name: userData.data.currentOrganization.name,
          color: userData.data.currentOrganization.color,
          icon: userData.data.currentOrganization.icon,
          colorType: typeof userData.data.currentOrganization.color,
          iconType: typeof userData.data.currentOrganization.icon
        });

        setUser(userData.data.user);
        
        // ✅ CRITICAL: Store color and icon from API
        setOrganizationData({
          id: userData.data.currentOrganization.id,
          name: userData.data.currentOrganization.name,
          slug: userData.data.currentOrganization.slug,
          description: userData.data.currentOrganization.description,
          color: userData.data.currentOrganization.color,      // ✅ Store as-is (can be null)
          icon: userData.data.currentOrganization.icon,        // ✅ Store as-is (can be null)
          role: userData.data.permissions.currentRole
        });

        console.log('🔍 Loading departments for organization...');
        const deptResponse = await fetch(`/api/${orgSlug}`, {
          credentials: 'include',
        });

        if (!deptResponse.ok) {
          throw new Error(`Failed to load departments: ${deptResponse.status}`);
        }

        const deptData = await deptResponse.json();
        
        if (!deptData.success) {
          throw new Error(deptData.error || 'Failed to load departments');
        }

        setDepartments(deptData.departments);
        console.log('✅ Departments loaded:', deptData.departments.length);
        setLoading(false);

      } catch (err) {
        console.error('❌ Failed to load organization data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load organization');
        setLoading(false);
      }
    };

    if (orgSlug) {
      loadOrganizationData();
    }
  }, [orgSlug, router]);

  useEffect(() => {
    if (deptSlug && departments.length > 0) {
      const foundDepartment = findDepartmentBySlug(departments, deptSlug);
      setSelectedDepartment(foundDepartment);
      console.log('📍 Selected department updated:', foundDepartment?.name || 'Not found');
    } else {
      setSelectedDepartment(null);
    }
  }, [deptSlug, departments]);

  // ✅ CRITICAL: Create organization object with proper defaults
  const organization = organizationData ? {
    id: organizationData.id,
    name: organizationData.name,
    slug: organizationData.slug,
    description: organizationData.description || `องค์กร ${organizationData.name}`,
    
    // ✅ CRITICAL: Use color and icon from API, with defaults if null
    color: organizationData.color || 'BLUE',
    icon: organizationData.icon || 'BUILDING',
    
    // Keep old logo for backward compatibility
    logo: organizationData.name.substring(0, 2).toUpperCase(),
    
    userRole: organizationData.role,
    stats: {
      totalProducts: departments.reduce((sum: number, dept: FrontendDepartment) => sum + dept.stockItems, 0),
      lowStockItems: departments.reduce((sum: number, dept: FrontendDepartment) => sum + dept.lowStock, 0),
      pendingTransfers: 15,
      activeUsers: departments.reduce((sum: number, dept: FrontendDepartment) => sum + dept.memberCount, 0),
      totalValue: '12.5M',
      departments: departments.length
    }
  } : null;

  // ✅ DEBUG: Log final organization object
  if (organization) {
    console.log('🎨 Layout - Final Organization Object:', {
      name: organization.name,
      color: organization.color,
      icon: organization.icon,
      colorType: typeof organization.color,
      iconType: typeof organization.icon
    });
  }

  const handleSidebarDepartmentSelect = (dept: FrontendDepartment) => {
    router.push(`/${orgSlug}/${dept.slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">กำลังโหลด</h3>
            <p className="text-gray-600">กำลังโหลดข้อมูลองค์กร...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user || !organization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="space-y-4">
              <div className="flex justify-center">
                <AlertTriangle className="w-16 h-16 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                ไม่สามารถเข้าถึงได้
              </h3>
              <p className="text-gray-600">
                {error || 'ไม่พบข้อมูลองค์กร'}
              </p>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  กลับหน้าหลัก
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => router.push('/login')}
                  className="w-full"
                >
                  เข้าสู่ระบบใหม่
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* ✅ CRITICAL: Pass organization object with color & icon */}
      <DashboardSidebar
        organization={organization}
        departments={departments}
        selectedDepartment={selectedDepartment}
        onSelectDepartment={handleSidebarDepartmentSelect}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <div className={`flex-1 flex flex-col ${sidebarCollapsed ? 'ml-16' : 'ml-80'} transition-all duration-200`}>
        <DashboardHeader
          organization={organization}
          selectedDepartment={selectedDepartment}
        />

        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}