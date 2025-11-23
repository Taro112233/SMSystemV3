// components/TransferManagement/TransferOverview/OrganizationTransfersView.tsx
// OrganizationTransfersView - Organization-level transfers overview

'use client';

import { useState, useEffect } from 'react';
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
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [filters, setFilters] = useState<TransferFiltersState>({
    search: '',
    status: 'all',
    priority: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Stats calculation
  const stats = {
    pending: transfers.filter((t) => t.status === 'PENDING').length,
    approved: transfers.filter((t) => t.status === 'APPROVED').length,
    prepared: transfers.filter((t) => t.status === 'PREPARED').length,
    completed: transfers.filter((t) => t.status === 'COMPLETED').length,
  };

  useEffect(() => {
    fetchTransfers();
  }, [organizationId, filters]);

  const fetchTransfers = async () => {
    try {
      setLoading(true);

      // TODO: Implement API call
      // const response = await fetch(`/api/${orgSlug}/transfers?...`);
      // const data = await response.json();
      // setTransfers(data.transfers);

      // Mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500));
      setTransfers([]);
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

      <OverviewStats {...stats} />

      <Card>
        <CardContent className="p-6">
          <OverviewFilters filters={filters} onFilterChange={handleFilterChange} />

          <div className="mt-4">
            <TransferTable
              transfers={transfers}
              orgSlug={orgSlug}
              viewType="organization"
            />
          </div>

          {!loading && transfers.length > 0 && (
            <div className="mt-4 text-sm text-gray-500">
              พบ {transfers.length} รายการ
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}