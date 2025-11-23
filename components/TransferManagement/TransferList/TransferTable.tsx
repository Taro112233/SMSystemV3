// components/TransferManagement/TransferList/TransferTable.tsx
// TransferTable - Table wrapper

'use client';

import { Transfer } from '@/types/transfer';
import TransferTableHeader from './TransferTableHeader';
import TransferTableRow from './TransferTableRow';
import TransferEmptyState from './TransferEmptyState';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

interface TransferTableProps {
  transfers: Transfer[];
  orgSlug: string;
  deptSlug?: string;
  viewType: 'outgoing' | 'incoming' | 'organization';
  loading?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

export default function TransferTable({
  transfers,
  orgSlug,
  deptSlug,
  viewType,
  loading = false,
  sortBy = 'requestedAt',
  sortOrder = 'desc',
  onSort = () => {},
}: TransferTableProps) {
  if (loading) {
    return (
      <div className="py-12 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
        <p className="text-sm text-gray-500 mt-2">กำลังโหลด...</p>
      </div>
    );
  }

  if (transfers.length === 0) {
    return <TransferEmptyState />;
  }

  return (
    <div className="mt-4 -mx-6">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="px-6">
          <table className="w-full min-w-[1000px]">
            <TransferTableHeader
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
              viewType={viewType}
            />
            <tbody className="divide-y divide-gray-200">
              {transfers.map((transfer) => (
                <TransferTableRow
                  key={transfer.id}
                  transfer={transfer}
                  orgSlug={orgSlug}
                  deptSlug={deptSlug}
                  viewType={viewType}
                />
              ))}
            </tbody>
          </table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}