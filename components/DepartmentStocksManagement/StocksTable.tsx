// components/DepartmentStocksManagement/StocksTable.tsx
// StocksTable - Main table component

'use client';

import { DepartmentStock, StockFilters } from '@/types/stock';
import StocksTableHeader from './StocksTableHeader';
import StocksTableRow from './StocksTableRow';
import StocksFilters from './StocksFilters';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

interface StocksTableProps {
  stocks: DepartmentStock[];
  loading: boolean;
  filters: StockFilters;
  onFilterChange: (filters: Partial<StockFilters>) => void;
  onViewClick: (stock: DepartmentStock) => void;
  canManage: boolean;
}

export default function StocksTable({
  stocks,
  loading,
  filters,
  onFilterChange,
  onViewClick,
  canManage,
}: StocksTableProps) {
  const handleSort = (field: string) => {
    const newOrder =
      filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    onFilterChange({
      sortBy: field as StockFilters['sortBy'],
      sortOrder: newOrder,
    });
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Filters */}
        <StocksFilters filters={filters} onFilterChange={onFilterChange} />

        {/* Table */}
        <div className="mt-4 -mx-6">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="px-6">
              <table className="w-full min-w-[1400px]">
                <StocksTableHeader
                  sortBy={filters.sortBy || 'productName'}
                  sortOrder={filters.sortOrder || 'asc'}
                  onSort={handleSort}
                />
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                        <p className="text-sm text-gray-500 mt-2">กำลังโหลด...</p>
                      </td>
                    </tr>
                  ) : stocks.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center">
                        <p className="text-sm text-gray-500">ไม่พบข้อมูลสต็อก</p>
                        <p className="text-xs text-gray-400 mt-1">
                          เริ่มต้นใช้งานโดยการเพิ่มสินค้าเข้าสู่สต็อก
                        </p>
                      </td>
                    </tr>
                  ) : (
                    stocks.map((stock) => (
                      <StocksTableRow
                        key={stock.id}
                        stock={stock}
                        onViewClick={onViewClick}
                        canManage={canManage}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Results count */}
        {!loading && stocks.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            พบ {stocks.length} รายการ
          </div>
        )}
      </CardContent>
    </Card>
  );
}