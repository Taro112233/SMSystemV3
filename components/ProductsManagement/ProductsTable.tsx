// components/ProductsManagement/ProductsTable.tsx
// ProductsTable - Main table component with category columns

'use client';

import { Product } from '@prisma/client';
import { ProductFilters } from '@/lib/product-helpers';
import { CategoryWithOptions } from '@/lib/category-helpers';
import ProductsTableHeader from './ProductsTableHeader';
import ProductsTableRow from './ProductsTableRow';
import ProductsFilters from './ProductsFilters';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ProductsTableProps {
  products: any[];
  categories: CategoryWithOptions[];
  loading: boolean;
  filters: ProductFilters;
  categoryFilters: any;
  onFilterChange: (filters: Partial<ProductFilters>) => void;
  onCategoryFilterChange: (filters: any) => void;
  onEditClick: (product: any) => void;
  onViewClick: (product: any) => void;
  onDeleteClick: (product: any) => void;
  onToggleStatus: (product: any, newStatus: boolean) => void;
  canManage: boolean;
}

export default function ProductsTable({
  products,
  categories,
  loading,
  filters,
  categoryFilters,
  onFilterChange,
  onCategoryFilterChange,
  onEditClick,
  onViewClick,
  onDeleteClick,
  onToggleStatus,
  canManage,
}: ProductsTableProps) {
  const handleSort = (field: string) => {
    const newOrder =
      filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    onFilterChange({
      sortBy: field as any,
      sortOrder: newOrder,
    });
  };

  // Get top 3 categories for display
  const top3Categories = categories.slice(0, 3);

  return (
    <Card>
      <CardContent className="p-6">
        {/* Filters */}
        <ProductsFilters
          filters={filters}
          categoryFilters={categoryFilters}
          categories={top3Categories}
          onFilterChange={onFilterChange}
          onCategoryFilterChange={onCategoryFilterChange}
        />

        {/* Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full">
            <ProductsTableHeader
              sortBy={filters.sortBy || 'createdAt'}
              sortOrder={filters.sortOrder || 'desc'}
              categories={top3Categories}
              onSort={handleSort}
              canManage={canManage}
            />
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9 + top3Categories.length} className="py-8 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                    <p className="text-sm text-gray-500 mt-2">กำลังโหลด...</p>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={9 + top3Categories.length} className="py-8 text-center">
                    <p className="text-sm text-gray-500">ไม่พบข้อมูลสินค้า</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <ProductsTableRow
                    key={product.id}
                    product={product}
                    categories={top3Categories}
                    onEditClick={onEditClick}
                    onViewClick={onViewClick}
                    onDeleteClick={onDeleteClick}
                    onToggleStatus={onToggleStatus}
                    canManage={canManage}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Results count */}
        {!loading && products.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            พบ {products.length} รายการ
          </div>
        )}
      </CardContent>
    </Card>
  );
}