// app/org/[orgSlug]/members/page.tsx
// OrganizationMembers - Main members management page

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/utils/auth';
import { useRouter } from 'next/navigation';
import { organization, departments, recentActivities } from '../../../../data/orgMockData';
import { DashboardSidebar } from '../../../../components/OrganizationLayout';
import { DashboardHeader } from '../../../../components/OrganizationLayout/OrganizationHeader';
import { MembersManagement } from '../../../../components/MembersManagement';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertTriangle, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OrganizationMembersProps {
  params: {
    orgSlug: string;
  };
}

const OrganizationMembers = ({ params }: OrganizationMembersProps) => {
  // ✅ State Management
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ Hooks
  const { user, currentOrganization, userRole, loading: authLoading } = useAuth();
  const router = useRouter();

  // ✅ Initialize page
  useEffect(() => {
    const initializePage = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Simulate API loading delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check if user has permission to access members management
        if (!user || !currentOrganization) {
          setError('ไม่พบข้อมูลองค์กรหรือผู้ใช้');
          return;
        }

        // Check organization slug matching
        if (currentOrganization.slug !== params.orgSlug) {
          setError('ไม่สามารถเข้าถึงองค์กรนี้ได้');
          return;
        }

        // Check user permission for members management
        if (!userRole || (userRole !== 'ADMIN' && userRole !== 'OWNER')) {
          setError('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ ต้องเป็น Admin หรือ Owner เท่านั้น');
          return;
        }

      } catch (err) {
        console.error('Members page initialization error:', err);
        setError('เกิดข้อผิดพลาดในการโหลดหน้า');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      initializePage();
    }
  }, [user, currentOrganization, userRole, params.orgSlug, authLoading]);

  // ✅ Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">กำลังโหลด</h3>
            <p className="text-gray-600">
              {authLoading ? 'กำลังตรวจสอบสิทธิ์...' : 'กำลังโหลดข้อมูลสมาชิก...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <AlertTriangle className="w-16 h-16 text-red-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">ไม่สามารถเข้าถึงได้</h3>
                  <p className="text-gray-600">{error}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => router.push(`/org/${params.orgSlug}`)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    กลับไปหน้าหลัก
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    เลือกองค์กรอื่น
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ✅ No organization or user
  if (!user || !currentOrganization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">ไม่พบข้อมูลผู้ใช้หรือองค์กร</p>
        </div>
      </div>
    );
  }

  // ✅ Main render - Members Management Page
  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Fixed Sidebar */}
      <DashboardSidebar
        organization={organization}
        departments={departments}
        selectedDepartment={null} // No department selection for members page
        onSelectDepartment={() => {}} // No department selection for members page
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col ${sidebarCollapsed ? 'ml-16' : 'ml-80'} transition-all duration-200`}>
        {/* Header */}
        <DashboardHeader
          organization={organization}
          selectedDepartment={null}
        />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          {/* Page Title */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  จัดการสมาชิก
                </h1>
                <p className="text-gray-600">
                  จัดการสมาชิกในองค์กร {currentOrganization.name}
                </p>
              </div>
            </div>
          </div>

          {/* Permission Check Alert */}
          {(userRole === 'MEMBER') && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                คุณไม่มีสิทธิ์จัดการสมาชิก หน้านี้แสดงเฉพาะการดูข้อมูลเท่านั้น
              </AlertDescription>
            </Alert>
          )}

          {/* Members Management Component */}
          <MembersManagement
            organization={{
              id: currentOrganization.id,
              name: currentOrganization.name,
              slug: currentOrganization.slug,
            }}
            currentUser={{
              id: user.id,
              role: userRole || 'MEMBER',
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default OrganizationMembers;