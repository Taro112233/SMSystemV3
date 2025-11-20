// components/ProductsManagement/ProductsTable.tsx
// ProductsTable - UPDATED: Pass orgSlug to ProductsTableRow

'use client';

import { ProductFilters, SortableProductField, SortOrder } from '@/lib/product-helpers';
import { CategoryWithOptions } from '@/lib/category-helpers';
import { ProductUnit } from '@/types/product-unit';
import { ProductData, CategoryFiltersState } from '@/types/product';
import ProductsTableHeader from './ProductsTableHeader';
import ProductsTableRow from './ProductsTableRow';
import ProductsFilters from './ProductsFilters';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

interface ProductsTableProps {
  products: ProductData[];
  categories: CategoryWithOptions[];
  productUnits: ProductUnit[];
  orgSlug: string;
  loading: boolean;
  filters: ProductFilters;
  categoryFilters: CategoryFiltersState;
  onFilterChange: (filters: Partial<ProductFilters>) => void;
  onCategoryFilterChange: (filters: CategoryFiltersState) => void;
  onEditClick: (product: ProductData) => void;
  onViewClick: (product: ProductData) => void;
  onDeleteClick: (product: ProductData) => void;
  onToggleStatus: (product: ProductData, newStatus: boolean) => void;
  canManage: boolean;
  pendingStatusChanges?: Map<string, boolean>;
  onSaveStatusChanges?: () => void;
}

export default function ProductsTable({
  products,
  categories,
  productUnits,
  orgSlug,
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
  pendingStatusChanges,
  onSaveStatusChanges,
}: ProductsTableProps) {
  const handleSort = (field: string) => {
    const newOrder: SortOrder =
      filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    onFilterChange({
      sortBy: field as SortableProductField,
      sortOrder: newOrder,
    });
  };

  const top3Categories = categories.slice(0, 3);
  const hasPendingChanges = pendingStatusChanges && pendingStatusChanges.size > 0;

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Filters */}
        <ProductsFilters
          filters={filters}
          categoryFilters={categoryFilters}
          categories={top3Categories}
          onFilterChange={onFilterChange}
          onCategoryFilterChange={onCategoryFilterChange}
          onSaveStatusChanges={onSaveStatusChanges}
          hasPendingChanges={hasPendingChanges}
        />

        {/* Table */}
        <div className="mt-4 -mx-6">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="px-6">
              <table className="w-full min-w-[1200px]">
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
                      <td colSpan={7 + top3Categories.length} className="py-8 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                        <p className="text-sm text-gray-500 mt-2">กำลังโหลด...</p>
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={7 + top3Categories.length} className="py-8 text-center">
                        <p className="text-sm text-gray-500">ไม่พบข้อมูลสินค้า</p>
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <ProductsTableRow
                        key={product.id}
                        product={product}
                        categories={top3Categories}
                        productUnits={productUnits}
                        orgSlug={orgSlug}
                        onEditClick={onEditClick}
                        onViewClick={onViewClick}
                        onDeleteClick={onDeleteClick}
                        onToggleStatus={onToggleStatus}
                        canManage={canManage}
                        pendingStatusChanges={pendingStatusChanges}
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
        {!loading && products.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            พบ {products.length} รายการ
          </div>
        )}
      </CardContent>
    </Card>
  );
}