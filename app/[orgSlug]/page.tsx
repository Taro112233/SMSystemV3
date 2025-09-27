// app/[orgSlug]/page.tsx - UPDATED: Uses Real Department Data
// Organization page that shows only OrganizationOverview with real department data

"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertTriangle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import dashboard components
import { DashboardSidebar } from '../../components/OrganizationLayout';
import { DashboardHeader } from '../../components/OrganizationLayout/OrganizationHeader';
import { OrganizationOverview } from '../../components/OrganizationDashboard';

// Import mock data for activities (departments are now real)
import { recentActivities } from '@/data/orgMockData';

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
  description: string;
  color: string;
  icon: any;
  isActive: boolean;
  memberCount: number;
  stockItems: number;
  lowStock: number;
  notifications: number;
  manager: string;
  lastActivity: string;
  category: string;
}

const OrganizationPage = () => {
  const params = useParams();
  const orgSlug = params.orgSlug as string;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null);
  
  // ✅ Add state for real departments data
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  
  // Dashboard state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ Function to load departments from API
  const loadDepartments = async (orgSlug: string) => {
  try {
    setDepartmentsLoading(true);
    console.log('Loading departments for:', orgSlug);
    
    const response = await fetch(`/api/${orgSlug}`, { // ✅ เปลี่ยนจาก /departments
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to load organization data: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      setDepartments(data.departments);
      console.log('Departments loaded:', data.departments.length, 'departments');
    }
  } catch (err) {
    console.error('Failed to load departments:', err);
    setDepartments([]);
  } finally {
    setDepartmentsLoading(false);
  }
};

  // Get user and organization data from API
  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Loading page data for:', orgSlug);

        // Get current user with organization context
        const response = await fetch(`/api/auth/me?orgSlug=${orgSlug}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.log('❌ Unauthorized, redirecting to login');
            router.push('/login');
            return;
          }
          throw new Error(`Failed to load user data: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to load user data');
        }

        console.log('✅ User data loaded:', data.data.user.username);
        console.log('✅ Current organization:', data.data.currentOrganization?.name);

        // Check if user has access to this organization
        if (!data.data.currentOrganization || data.data.currentOrganization.slug !== orgSlug) {
          console.log('❌ No access to organization:', orgSlug);
          setError('No access to this organization');
          setLoading(false);
          return;
        }

        // Set user and organization data
        setUser(data.data.user);
        setOrganizationData({
          id: data.data.currentOrganization.id,
          name: data.data.currentOrganization.name,
          slug: data.data.currentOrganization.slug,
          description: data.data.currentOrganization.description,
          role: data.data.permissions.currentRole
        });

        // ✅ Load departments after organization data is set
        await loadDepartments(orgSlug);

        console.log('✅ Page data loaded successfully');
        setLoading(false);

      } catch (err) {
        console.error('❌ Failed to load page data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load page');
        setLoading(false);
      }
    };

    if (orgSlug) {
      loadPageData();
    }
  }, [orgSlug, router]);

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
      departments: departments.length // ✅ Use real departments count
    }
  } : null;

  // Handle department selection from OrganizationOverview
  const handleSelectDepartment = (dept: any) => {
    // Navigate to department-specific page (flat URL)
    const deptCode = dept.code.toLowerCase();
    router.push(`/${orgSlug}/${deptCode}`);
  };

  // Handle department selection from sidebar
  const handleSidebarDepartmentSelect = (dept: any) => {
    // Navigate to department-specific page (flat URL)
    const deptCode = dept.code.toLowerCase();
    router.push(`/${orgSlug}/${deptCode}`);
  };

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
            <p className="text-gray-600">กำลังโหลดข้อมูลองค์กร...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
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
              
              {/* Debug info */}
              <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded">
                <div>User: {user ? 'Found' : 'Not Found'}</div>
                <div>Org Slug: {orgSlug}</div>
                <div>Organization: {organization ? 'Found' : 'Not Found'}</div>
                <div>Departments: {departments.length}</div>
                <div>Error: {error || 'None'}</div>
              </div>

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

  // Show organization dashboard - ALWAYS OrganizationOverview
  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Fixed Sidebar */}
      <DashboardSidebar
        organization={organization}
        departments={departments} // ✅ Use real departments data instead of mock
        selectedDepartment={null} // No department selected on org overview
        onSelectDepartment={handleSidebarDepartmentSelect} // Navigate to dept page
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col ${sidebarCollapsed ? 'ml-16' : 'ml-80'} transition-all duration-200`}>
        <DashboardHeader
          organization={organization}
          selectedDepartment={null} // No department selected
        />

        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          {/* Show loading indicator for departments if needed */}
          {departmentsLoading && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-blue-700">กำลังโหลดข้อมูลแผนก...</span>
              </div>
            </div>
          )}
          
          {/* ALWAYS show OrganizationOverview for organization pages */}
          <OrganizationOverview
            organization={organization}
            departments={departments} // ✅ Use real departments data
            recentActivities={recentActivities} // Still using mock data for now
            onSelectDepartment={handleSelectDepartment} // Navigate to dept page
          />
        </main>
      </div>

      {/* Success indicator with departments count */}
      <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
        ✅ {user.firstName} {user.lastName} | {organizationData?.role} | Depts: {departments.length}
      </div>
    </div>
  );
};

export default OrganizationPage;