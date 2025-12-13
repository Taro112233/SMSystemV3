// components/TransferManagement/TransferOverview/OverviewFilters.tsx
// OverviewFilters - Filters for org view

'use client';

import { TransferFiltersState, TransferStatus, TransferPriority } from '@/types/transfer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, X, Search } from 'lucide-react';

interface OverviewFiltersProps {
  filters: TransferFiltersState;
  onFilterChange: (filters: Partial<TransferFiltersState>) => void;
}

export default function OverviewFilters({
  filters,
  onFilterChange,
}: OverviewFiltersProps) {
  const hasActiveFilters =
    filters.status !== 'all' || filters.priority !== 'all' || filters.search;

  const handleReset = () => {
    onFilterChange({
      search: '',
      status: 'all',
      priority: 'all',
    });
  };

  return (
    <div className="flex items-center gap-3 pb-4 border-b border-gray-200 flex-wrap">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Filter className="h-4 w-4" />
        <span>กรองข้อมูล:</span>
      </div>

      {/* Search */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="ค้นหารหัส, หัวข้อ..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="pl-9"
        />
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">สถานะ:</span>
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) =>
            onFilterChange({ status: value as TransferStatus | 'all' })
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="PENDING">รออนุมัติ</SelectItem>
            <SelectItem value="APPROVED">อนุมัติแล้ว</SelectItem>
            <SelectItem value="PREPARED">จัดเตรียมแล้ว</SelectItem>
            <SelectItem value="PARTIAL">รับบางส่วน</SelectItem>
            <SelectItem value="COMPLETED">เสร็จสมบูรณ์</SelectItem>
            <SelectItem value="CANCELLED">ยกเลิก</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Priority */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">ความสำคัญ:</span>
        <Select
          value={filters.priority || 'all'}
          onValueChange={(value) =>
            onFilterChange({ priority: value as TransferPriority | 'all' })
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="NORMAL">ปกติ</SelectItem>
            <SelectItem value="URGENT">ด่วน</SelectItem>
            <SelectItem value="CRITICAL">ด่วนมาก</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="gap-1 text-gray-600"
        >
          <X className="h-4 w-4 text-red-500" />
          <p className='text-red-500'>ล้างตัวกรอง</p>
        </Button>
      )}
    </div>
  );
}