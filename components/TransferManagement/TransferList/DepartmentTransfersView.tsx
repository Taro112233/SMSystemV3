// components/TransferManagement/TransferList/DepartmentTransfersView.tsx
// DepartmentTransfersView - Main container with tabs (outgoing/incoming)

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

      // TODO: Implement API calls
      // const endpoint = activeTab === 'outgoing'
      //   ? `/api/${orgSlug}/${departmentSlug}/transfers/outgoing`
      //   : `/api/${orgSlug}/${departmentSlug}/transfers/incoming`;
      // const response = await fetch(endpoint);
      // const data = await response.json();

      // Mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (activeTab === 'outgoing') {
        setOutgoingTransfers([]);
      } else {
        setIncomingTransfers([]);
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