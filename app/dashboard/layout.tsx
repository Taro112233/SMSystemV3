// FILE: app/dashboard/layout.tsx - Alternative Approach
// Dashboard Layout - Fetch user data directly from API
// ============================================

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { DashboardHeader } from '@/components/OrganizationList/DashboardHeader';
import { toast } from 'sonner';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  color: string;
  icon: string;
  userRole: 'OWNER' | 'ADMIN' | 'MEMBER';
  isOwner: boolean;
  joinedAt: string;
  lastActivity: string;
  stats: {
    departments: number;
    products: number;
    lowStock: number;
    activeUsers: number;
    pendingTransfers?: number;
  };
  notifications: number;
  isActive: boolean;
  status?: string;
}

interface HeaderUser {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [user, setUser] = useState<HeaderUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // We're intentionally only running this once on mount

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // ✅ ดึงข้อมูล user และ organizations พร้อมกัน
      const [dashboardRes, userRes] = await Promise.all([
        fetch('/api/dashboard', { credentials: 'include' }),
        fetch('/api/auth/me', { credentials: 'include' })
      ]);

      // Check authentication
      if (!userRes.ok) {
        if (userRes.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to load user data');
      }

      const userData = await userRes.json();

      if (userData.success && userData.data.user) {
        const u = userData.data.user;
        setUser({
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          fullName: u.fullName,
          email: u.email || '',
        });
      }

      // Load organizations
      if (!dashboardRes.ok) {
        throw new Error('Failed to fetch organizations');
      }

      const dashboardData = await dashboardRes.json();

      if (dashboardData.success) {
        setOrganizations(dashboardData.organizations);
      } else {
        throw new Error(dashboardData.error || 'Failed to load organizations');
      }

    } catch (error) {
      console.error('Load dashboard data error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to load data';
      toast.error('ไม่สามารถโหลดข้อมูลได้', {
        description: errorMsg
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
    toast.success('รีเฟรชข้อมูลแล้ว');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // ✅ DEBUG: Log to verify user data
  console.log('🔍 Dashboard Layout - User Data:', {
    hasUser: !!user,
    user,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        organizations={organizations}
        user={user}
        onRefresh={handleRefresh}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}