// components/DepartmentStocksManagement/index.tsx
// UPDATED: Remove departmentId prop (not needed for API)

'use client';

import { useState, useEffect, useCallback } from 'react';
import { DepartmentStock, StockFilters } from '@/types/stock';
import StocksHeader from './StocksHeader';
import StockDetailDialog from './StockDetailDialog';
import AddStockDialog from './AddStockDialog';
import StocksTable from './StocksTable';
import { toast } from 'sonner';

interface DepartmentStocksManagementProps {
  orgSlug: string;
  deptSlug: string;
  departmentName: string;
  userRole: string;
}

export default function DepartmentStocksManagement({
  orgSlug,
  deptSlug,
  departmentName,
  userRole,
}: DepartmentStocksManagementProps) {
  const [stocks, setStocks] = useState<DepartmentStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<StockFilters>({
    search: '',
    showLowStock: false,
    showExpiring: false,
    sortBy: 'productName',
    sortOrder: 'asc',
  });

  // Dialog states
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<DepartmentStock | null>(null);

  const canManage: boolean = Boolean(
    userRole && ['ADMIN', 'OWNER', 'MEMBER'].includes(userRole)
  );

  // Fetch stocks
  const fetchStocks = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.showLowStock) params.append('showLowStock', 'true');
      if (filters.showExpiring) params.append('showExpiring', 'true');
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/${orgSlug}/${deptSlug}/stocks?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch stocks');
      }

      const data = await response.json();
      setStocks(data.data || []);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      toast.error('เกิดข้อผิดพลาด', {
        description: 'ไม่สามารถโหลดข้อมูลสต็อกได้',
      });
    } finally {
      setLoading(false);
    }
  }, [orgSlug, deptSlug, filters]);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  // Handlers
  const handleAddStock = () => {
    setIsAddStockOpen(true);
  };

  const handleViewClick = (stock: DepartmentStock) => {
    setSelectedStock(stock);
    setIsDetailOpen(true);
  };

  const handleFilterChange = (newFilters: Partial<StockFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleStockUpdate = () => {
    setIsDetailOpen(false);
    setSelectedStock(null);
    fetchStocks();
    toast.success('สำเร็จ', {
      description: 'แก้ไขข้อมูลสต็อกเรียบร้อย',
    });
  };

  const handleAddStockSuccess = () => {
    setIsAddStockOpen(false);
    fetchStocks();
    toast.success('สำเร็จ', {
      description: 'เพิ่มสินค้าเข้าสต็อกเรียบร้อย',
    });
  };

  return (
    <div className="space-y-6">
      <StocksHeader
        departmentName={departmentName}
        onSearchChange={(search: string) => handleFilterChange({ search })}
        onAddStock={handleAddStock}
        searchValue={filters.search || ''}
        canManage={canManage}
      />

      <StocksTable
        stocks={stocks}
        loading={loading}
        filters={filters}
        onFilterChange={handleFilterChange}
        onViewClick={handleViewClick}
        canManage={canManage}
      />

      <StockDetailDialog
        stock={selectedStock}
        orgSlug={orgSlug}
        deptSlug={deptSlug}
        canManage={canManage}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onUpdateSuccess={handleStockUpdate}
      />

      <AddStockDialog
        orgSlug={orgSlug}
        deptSlug={deptSlug}
        open={isAddStockOpen}
        onOpenChange={setIsAddStockOpen}
        onSuccess={handleAddStockSuccess}
      />
    </div>
  );
}