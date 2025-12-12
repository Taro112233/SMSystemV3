// components/ProductsManagement2/ProductsTable.tsx
// ProductsTable - Minimal table with pagination

'use client';

import { ProductFilters } from '@/lib/product-helpers';
import { CategoryWithOptions } from '@/lib/category-helpers';
import { ProductUnit } from '@/types/product-unit';
import { ProductData, CategoryFiltersState } from '@/types/product';
import ProductsTableHeader from './ProductsTableHeader';
import ProductsTableRow from './ProductsTableRow';
import ProductsFilters from './ProductsFilters';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

interface ProductsTableProps {
  products: ProductData[];
  categories: CategoryWithOptions[];
  productUnits: ProductUnit[];
  orgSlug: string;
  loading: boolean;
  filters: ProductFilters;
  categoryFilters: CategoryFiltersState;
  pagination: PaginationState;
  onFilterChange: (filters: Partial<ProductFilters>) => void;
  onCategoryFilterChange: (filters: CategoryFiltersState) => void;
  onPageChange: (page: number) => void;
  onViewClick: (product: ProductData) => void;
  onEditClick: (product: ProductData) => void;
  onDeleteClick: (product: ProductData) => void;
  canManage: boolean;
}

export default function ProductsTable({
  products,
  categories,
  productUnits,
  orgSlug,
  loading,
  filters,
  categoryFilters,
  pagination,
  onFilterChange,
  onCategoryFilterChange,
  onPageChange,
  onViewClick,
  onEditClick,
  onDeleteClick,
  canManage,
}: ProductsTableProps) {
  const handleSort = (field: string) => {
    const newOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    onFilterChange({
      sortBy: field as any,
      sortOrder: newOrder,
    });
  };

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);
  const startItem = (pagination.page - 1) * pagination.pageSize + 1;
  const endItem = Math.min(pagination.page * pagination.pageSize, pagination.total);

  return (
    <Card className="border-gray-200">
      <div className="p-4 space-y-4">
        {/* Filters */}
        <ProductsFilters
          filters={filters}
          categoryFilters={categoryFilters}
          categories={categories.slice(0, 3)}
          onFilterChange={onFilterChange}
          onCategoryFilterChange={onCategoryFilterChange}
        />

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <ProductsTableHeader
                sortBy={filters.sortBy || 'createdAt'}
                sortOrder={filters.sortOrder || 'desc'}
                categories={categories.slice(0, 3)}
                onSort={handleSort}
              />
              <tbody className="divide-y divide-gray-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-400" />
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-sm text-gray-500">
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <ProductsTableRow
                      key={product.id}
                      product={product}
                      categories={categories.slice(0, 3)}
                      productUnits={productUnits}
                      orgSlug={orgSlug}
                      onViewClick={onViewClick}
                      onEditClick={onEditClick}
                      onDeleteClick={onDeleteClick}
                      canManage={canManage}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {!loading && products.length > 0 && (
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">
              แสดง {startItem}-{endItem} จาก {pagination.total} รายการ
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-3 py-1 text-sm">
                หน้า {pagination.page} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}