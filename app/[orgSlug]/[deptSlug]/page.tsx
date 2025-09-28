// app/[orgSlug]/[deptSlug]/page.tsx - UPDATED FOR SEEDED DATA
// Department-specific page with seeded department data

"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import dashboard components
import { DashboardSidebar } from '@/components/OrganizationLayout';
import { DashboardHeader } from '@/components/OrganizationLayout/OrganizationHeader';
import { DepartmentView } from '@/components/DepartmentDashboard';
import { findDepartmentBySlug } from '@/lib/department-helpers';

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
  role: string;
}

interface DepartmentData {
  id: string;
  name: string;
  code: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
  memberCount: number;
  stockItems: number;
  lowStock: number;
  notifications: number;
  manager: string;
  lastActivity: string;
  category: string;
}

const DepartmentPage = () => {
  const params = useParams();
  const orgSlug = params.orgSlug as string;
  const deptSlug = params.deptSlug as string;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null);
  const [departmentData, setDepartmentData] = useState<DepartmentData | null>(null);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  
  // Dashboard state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Get user, organization and department data from API
  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Loading department page data for:', { orgSlug, deptSlug });

        // Get current user with organization context
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

        // Check if user has access to this organization
        if (!userData.data.currentOrganization || userData.data.currentOrganization.slug !== orgSlug) {
          console.log('❌ No access to organization:', orgSlug);
          setError('No access to this organization');
          setLoading(false);
          return;
        }

        // Set user and organization data
        setUser(userData.data.user);
        setOrganizationData({
          id: userData.data.currentOrganization.id,
          name: userData.data.currentOrganization.name,
          slug: userData.data.currentOrganization.slug,
          description: userData.data.currentOrganization.description,
          role: userData.data.permissions.currentRole
        });

        // ✅ Load departments from organization API
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

        // ✅ Find specific department using helper function
        const foundDepartment = findDepartmentBySlug(deptData.departments, deptSlug);

        if (!foundDepartment) {
          console.log('❌ Department not found:', deptSlug);
          console.log('Available departments:', deptData.departments.map((d: any) => ({ slug: d.slug, code: d.code, name: d.name })));
          setError(`Department '${deptSlug}' not found`);
          setLoading(false);
          return;
        }

        setDepartmentData(foundDepartment);
        console.log('✅ Department data loaded:', foundDepartment.name);
        console.log('✅ Page data loaded successfully');
        setLoading(false);

      } catch (err) {
        console.error('❌ Failed to load page data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load page');
        setLoading(false);
      }
    };

    if (orgSlug && deptSlug) {
      loadPageData();
    }
  }, [orgSlug, deptSlug, router]);

  // Create organization object for components
  const organization = organizationData ? {
    id: organizationData.id,
    name: organizationData.name,
    slug: organizationData.slug,
    description: organizationData.description || `องค์กร ${organizationData.name}`,
    logo: organizationData.name.substring(0, 2).toUpperCase(),
    color: 'bg-blue-500',
    userRole: organizationData.role,
    stats: {
      totalProducts: 1247,
      lowStockItems: 23,
      pendingTransfers: 15,
      activeUsers: 89,
      totalValue: '12.5M',
      departments: departments.length
    }
  } : null;

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">กำลังโหลด</h3>
            <p className="text-gray-600">กำลังโหลดข้อมูลแผนก...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !user || !organization || !departmentData) {
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
                {error || 'ไม่พบข้อมูลแผนก'}
              </p>
              
              {/* Debug info */}
              <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded">
                <div>User: {user ? 'Found' : 'Not Found'}</div>
                <div>Org Slug: {orgSlug}</div>
                <div>Dept Slug: {deptSlug}</div>
                <div>Organization: {organization ? 'Found' : 'Not Found'}</div>
                <div>Department: {departmentData ? 'Found' : 'Not Found'}</div>
                <div>All Departments: {departments.length}</div>
                <div>Available Dept Slugs: {departments.map(d => d.slug).join(', ')}</div>
                <div>Error: {error || 'None'}</div>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={() => router.push(`/${orgSlug}`)}
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  กลับไปองค์กร
                </Button>
                
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="w-full"
                  variant="outline"
                >
                  <Home className="w-4 h-4 mr-2" />
                  กลับหน้าหลัก
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show department dashboard
  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Fixed Sidebar */}
      <DashboardSidebar
        organization={organization}
        departments={departments}
        selectedDepartment={departmentData}
        onSelectDepartment={(dept) => {
          // ✅ Navigate using slug for URL consistency
          const deptCode = dept.slug.toLowerCase();
          router.push(`/${orgSlug}/${deptCode}`);
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col ${sidebarCollapsed ? 'ml-16' : 'ml-80'} transition-all duration-200`}>
        <DashboardHeader
          organization={organization}
          selectedDepartment={departmentData}
        />

        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <DepartmentView department={departmentData} />
        </main>
      </div>

      {/* Success indicator with department info */}
      <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
        ✅ {user.firstName} {user.lastName} | {organizationData?.role} | {departmentData.name} ({departmentData.slug})
      </div>
    </div>
  );
};

export default DepartmentPage;