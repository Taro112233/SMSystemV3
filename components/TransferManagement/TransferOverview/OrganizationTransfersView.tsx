// components/TransferManagement/TransferOverview/OrganizationTransfersView.tsx
// OrganizationTransfersView - OPTIMIZED with client-side filtering

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Transfer, TransferFiltersState } from '@/types/transfer';
import OverviewStats from './OverviewStats';
import OverviewFilters from './OverviewFilters';
import TransferTable from '../TransferList/TransferTable';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface OrganizationTransfersViewProps {
  organizationId: string;
  orgSlug: string;
}

export default function OrganizationTransfersView({
  organizationId,
  orgSlug,
}: OrganizationTransfersViewProps) {
  const [loading, setLoading] = useState(true);
  const [allTransfers, setAllTransfers] = useState<Transfer[]>([]); // ✅ Store all data
  const [filters, setFilters] = useState<TransferFiltersState>({
    search: '',
    status: 'all',
    priority: 'all',
    sortBy: 'requestedAt',
    sortOrder: 'desc',
  });

  // ✅ Client-side filtering - no API calls
  const filteredTransfers = useMemo(() => {
    let filtered = [...allTransfers];

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((t) => t.status === filters.status);
    }

    // Filter by priority
    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter((t) => t.priority === filters.priority);
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.code.toLowerCase().includes(searchLower) ||
          t.title.toLowerCase().includes(searchLower) ||
          t.requestingDepartment.name.toLowerCase().includes(searchLower) ||
          t.supplyingDepartment.name.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const sortBy = filters.sortBy || 'requestedAt';
      const order = filters.sortOrder === 'asc' ? 1 : -1;

      if (sortBy === 'requestedAt' || sortBy === 'createdAt') {
        return (
          (new Date(a[sortBy]).getTime() - new Date(b[sortBy]).getTime()) * order
        );
      }

      if (sortBy === 'priority') {
        const priorityOrder = { CRITICAL: 3, URGENT: 2, NORMAL: 1 };
        return (
          (priorityOrder[a.priority] - priorityOrder[b.priority]) * order
        );
      }

      return 0;
    });

    return filtered;
  }, [allTransfers, filters]);

  // ✅ Stats calculation from filtered data
  const stats = useMemo(() => ({
    pending: filteredTransfers.filter((t) => t.status === 'PENDING').length,
    approved: filteredTransfers.filter((t) => t.status === 'APPROVED').length,
    prepared: filteredTransfers.filter((t) => t.status === 'PREPARED').length,
    completed: filteredTransfers.filter((t) => ['DELIVERED', 'COMPLETED'].includes(t.status)).length,
  }), [filteredTransfers]);

  // ✅ Fetch all data only once
  useEffect(() => {
    fetchAllTransfers();
  }, [orgSlug]);

  const fetchAllTransfers = async () => {
    try {
      setLoading(true);

      // Fetch ALL transfers (no filters in API call)
      const response = await fetch(`/api/${orgSlug}/transfers`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transfers');
      }

      const data = await response.json();

      if (data.success) {
        setAllTransfers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching transfers:', error);
      toast.error('เกิดข้อผิดพลาด', {
        description: 'ไม่สามารถโหลดข้อมูลใบเบิกได้',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<TransferFiltersState>) => {
    // ✅ Just update state - no API call
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ภาพรวมใบเบิกทั้งหมด</h1>
        <p className="text-sm text-gray-500 mt-1">
          ภาพรวมการเบิกสินค้าภายในองค์กร
        </p>
      </div>

      {/* ✅ Stats from filtered data */}
      <OverviewStats {...stats} />

      <Card>
        <CardContent className="p-6">
          <OverviewFilters filters={filters} onFilterChange={handleFilterChange} />

          {/* ✅ Show filtered transfers */}
          <div className="mt-4">
            <TransferTable
              transfers={filteredTransfers}
              orgSlug={orgSlug}
              viewType="organization"
            />
          </div>

          {/* ✅ Show count of filtered results */}
          {!loading && (
            <div className="mt-4 text-sm text-gray-500">
              {filteredTransfers.length === allTransfers.length ? (
                <>พบ {allTransfers.length} รายการทั้งหมด</>
              ) : (
                <>
                  พบ {filteredTransfers.length} จาก {allTransfers.length} รายการ
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}