// components/TransferManagement/TransferList/DepartmentTransfersView.tsx
// UPDATED: Fix TypeScript errors with proper type handling

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Transfer, TransferFiltersState } from '@/types/transfer';
import { useRouter } from 'next/navigation';
import TransferFilters from './TransferFilters';
import TransferTable from './TransferTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DepartmentTransfersViewProps {
  departmentId: string;
  departmentSlug: string;
  departmentName: string;
  organizationId: string;
  orgSlug: string;
}

export default function DepartmentTransfersView({
  departmentSlug,
  departmentName,
  orgSlug,
}: DepartmentTransfersViewProps) {
  const router = useRouter();
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

  const fetchTransfers = useCallback(async () => {
    try {
      setLoading(true);

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

      const queryString = params.toString();

      // Fetch both outgoing and incoming in parallel
      const [outgoingResponse, incomingResponse] = await Promise.all([
        fetch(`/api/${orgSlug}/${departmentSlug}/transfers/outgoing?${queryString}`),
        fetch(`/api/${orgSlug}/${departmentSlug}/transfers/incoming?${queryString}`),
      ]);

      if (!outgoingResponse.ok || !incomingResponse.ok) {
        throw new Error('Failed to fetch transfers');
      }

      const [outgoingData, incomingData] = await Promise.all([
        outgoingResponse.json(),
        incomingResponse.json(),
      ]);

      if (!outgoingData.success || !incomingData.success) {
        throw new Error('Failed to fetch transfers');
      }

      setOutgoingTransfers(outgoingData.data || []);
      setIncomingTransfers(incomingData.data || []);
    } catch (error) {
      console.error('Error fetching transfers:', error);
      toast.error('เกิดข้อผิดพลาด', {
        description: 'ไม่สามารถโหลดข้อมูลใบเบิกได้',
      });
    } finally {
      setLoading(false);
    }
  }, [orgSlug, departmentSlug, filters]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const handleFilterChange = (newFilters: Partial<TransferFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleCreateClick = () => {
    router.push(`/${orgSlug}/${departmentSlug}/transfers/create`);
  };

  // ✅ Safe extraction with defaults
  const sortBy = filters.sortBy || 'requestedAt';
  const sortOrder = filters.sortOrder || 'desc';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการใบเบิก</h1>
          <p className="text-sm text-gray-500 mt-1">{departmentName}</p>
        </div>

        <Button onClick={handleCreateClick} className="gap-2">
          <Plus className="h-4 w-4" />
          สร้างใบเบิกใหม่
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <TransferFilters filters={filters} onFilterChange={handleFilterChange} />
        </CardContent>
      </Card>

      {/* Outgoing Transfers (รายการเบิกออก - ผู้ให้) */}
      <Card>
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ArrowUpCircle className="h-5 w-5 text-blue-600" />
            รายการเบิกออก ({outgoingTransfers.length})
            <span className="text-sm font-normal text-gray-500 ml-2">
              (หน่วยงานอื่นขอเบิกจากคุณ)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <TransferTable
            transfers={outgoingTransfers}
            orgSlug={orgSlug}
            deptSlug={departmentSlug}
            viewType="outgoing"
            loading={loading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={(field) => {
              const newOrder =
                filters.sortBy === field && filters.sortOrder === 'asc'
                  ? 'desc'
                  : 'asc';
              handleFilterChange({ sortBy: field as 'requestedAt' | 'createdAt' | 'priority', sortOrder: newOrder });
            }}
          />
        </CardContent>
      </Card>

      {/* Incoming Transfers (รายการรับเข้า - ผู้ขอ) */}
      <Card>
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ArrowDownCircle className="h-5 w-5 text-green-600" />
            รายการรับเข้า ({incomingTransfers.length})
            <span className="text-sm font-normal text-gray-500 ml-2">
              (คุณขอเบิกจากหน่วยงานอื่น)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <TransferTable
            transfers={incomingTransfers}
            orgSlug={orgSlug}
            deptSlug={departmentSlug}
            viewType="incoming"
            loading={loading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={(field) => {
              const newOrder =
                filters.sortBy === field && filters.sortOrder === 'asc'
                  ? 'desc'
                  : 'asc';
              handleFilterChange({ sortBy: field as 'requestedAt' | 'createdAt' | 'priority', sortOrder: newOrder });
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}