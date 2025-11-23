// components/TransferManagement/TransferList/DepartmentTransfersView.tsx
'use client';

import { useState, useEffect } from 'react';
import { Transfer, TransferFiltersState } from '@/types/transfer';
import { useRouter } from 'next/navigation';
import TransferListTabs from './TransferListTabs';
import TransferFilters from './TransferFilters';
import TransferTable from './TransferTable';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface DepartmentTransfersViewProps {
  departmentId: string;
  departmentSlug: string;
  departmentName: string;
  organizationId: string;
  orgSlug: string;
}

export default function DepartmentTransfersView({
  departmentId,
  departmentSlug,
  departmentName,
  orgSlug,
}: DepartmentTransfersViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'outgoing' | 'incoming'>('incoming');
  const [loading, setLoading] = useState(true);
  const [outgoingTransfers, setOutgoingTransfers] = useState<Transfer[]>([]);
  const [incomingTransfers, setIncomingTransfers] = useState<Transfer[]>([]);
  const [filters, setFilters] = useState<TransferFiltersState>({
    search: '',
    status: 'all',
    priority: 'all',
    sortBy: 'requestedAt',
    sortOrder: 'desc',
  });

  useEffect(() => {
    fetchTransfers();
  }, [departmentId, activeTab, filters]);

  const fetchTransfers = async () => {
    try {
      setLoading(true);

      const endpoint = activeTab === 'outgoing'
        ? `/api/${orgSlug}/${departmentSlug}/transfers/outgoing`
        : `/api/${orgSlug}/${departmentSlug}/transfers/incoming`;

      // Build query params
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters.priority && filters.priority !== 'all') {
        params.append('priority', filters.priority);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }

      const url = `${endpoint}?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch transfers');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch transfers');
      }

      if (activeTab === 'outgoing') {
        setOutgoingTransfers(data.data || []);
      } else {
        setIncomingTransfers(data.data || []);
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
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleCreateClick = () => {
    router.push(`/${orgSlug}/${departmentSlug}/transfers/create`);
  };

  const currentTransfers =
    activeTab === 'outgoing' ? outgoingTransfers : incomingTransfers;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการใบเบิก</h1>
          <p className="text-sm text-gray-500 mt-1">{departmentName}</p>
        </div>

        {activeTab === 'incoming' && (
          <Button onClick={handleCreateClick} className="gap-2">
            <Plus className="h-4 w-4" />
            สร้างใบเบิกใหม่
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          <TransferListTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            outgoingCount={outgoingTransfers.length}
            incomingCount={incomingTransfers.length}
          />

          <div className="mt-6">
            <TransferFilters filters={filters} onFilterChange={handleFilterChange} />

            <TransferTable
              transfers={currentTransfers}
              orgSlug={orgSlug}
              deptSlug={departmentSlug}
              viewType={activeTab}
              loading={loading}
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
              onSort={(field) => {
                const newOrder =
                  filters.sortBy === field && filters.sortOrder === 'asc'
                    ? 'desc'
                    : 'asc';
                handleFilterChange({ sortBy: field as any, sortOrder: newOrder });
              }}
            />

            {!loading && currentTransfers.length > 0 && (
              <div className="mt-4 text-sm text-gray-500">
                พบ {currentTransfers.length} รายการ
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}