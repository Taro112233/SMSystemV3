// FILE: app/dashboard/page.tsx - UPDATED to use layout
'use client';

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { AddOrganizationCard } from '@/components/OrganizationList/AddOrganizationCard';
import { OrganizationGrid } from '@/components/OrganizationList/OrganizationGrid';

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

const OrganizationSelector = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/dashboard', {
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch organizations');
      }

      if (data.success) {
        setOrganizations(data.organizations);
      } else {
        throw new Error(data.error || 'Failed to load organizations');
      }

    } catch (error) {
      console.error('Fetch organizations error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to load organizations';
      setError(errorMsg);
      toast.error('ไม่สามารถโหลดข้อมูลองค์กรได้', {
        description: errorMsg
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrganizationClick = (slug: string) => {
    window.location.href = `/${slug}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">กำลังโหลดองค์กร...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">เลือกองค์กรที่ต้องการจัดการ</h2>
        <p className="text-gray-600">คลิกที่การ์ดองค์กรเพื่อเข้าสู่ระบบจัดการ</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <OrganizationGrid 
          organizations={organizations}
          onOrganizationClick={handleOrganizationClick}
        />
        <AddOrganizationCard />
      </div>
    </>
  );
};

export default OrganizationSelector;