// components/ProductsManagement/ProductsTable.tsx
// ProductsTable - UPDATED: Add skeleton loading

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
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  onPageSizeChange: (pageSize: number) => void;
  onEditClick: (product: ProductData) => void;
  onViewClick: (product: ProductData) => void;
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
  onPageSizeChange,
  onViewClick,
  onEditClick,
  onDeleteClick,
  canManage,
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
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);
  const startItem = (pagination.page - 1) * pagination.pageSize + 1;
  const endItem = Math.min(pagination.page * pagination.pageSize, pagination.total);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 7;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (pagination.page <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (pagination.page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = pagination.page - 1; i <= pagination.page + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const SkeletonRow = () => (
    <tr>
      <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
      <td className="px-4 py-3"><Skeleton className="h-5 w-40" /></td>
      <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
      <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
      {top3Categories.map((cat) => (
        <td key={cat.id} className="px-4 py-3">
          <Skeleton className="h-5 w-24" />
        </td>
      ))}
      <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
      <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
      <td className="px-4 py-3"><Skeleton className="h-6 w-16" /></td>
    </tr>
  );

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <ProductsFilters
          filters={filters}
          categoryFilters={categoryFilters}
          categories={top3Categories}
          onFilterChange={onFilterChange}
          onCategoryFilterChange={onCategoryFilterChange}
        />

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
                    <>
                      {Array.from({ length: pagination.pageSize }).map((_, idx) => (
                        <SkeletonRow key={idx} />
                      ))}
                    </>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={8 + top3Categories.length} className="py-8 text-center">
                        <p className="text-sm text-gray-500">ไม่พบข้อมูลสินค้า</p>
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {products.map((product, index) => (
                        <motion.tr
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => onViewClick(product)}
                        >
                          <ProductsTableRow
                            product={product}
                            categories={top3Categories}
                            productUnits={productUnits}
                            orgSlug={orgSlug}
                            onEditClick={onEditClick}
                            onViewClick={onViewClick}
                            onDeleteClick={onDeleteClick}
                            canManage={canManage}
                          />
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {!loading && products.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>แสดง</span>
              <Select
                value={pagination.pageSize.toString()}
                onValueChange={(value) => onPageSizeChange(parseInt(value))}
              >
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span>รายการ</span>
              <span className="ml-2">
                ({startItem}-{endItem} จาก {pagination.total})
              </span>
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

              {getPageNumbers().map((pageNum, idx) =>
                pageNum === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
                    ...
                  </span>
                ) : (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(pageNum as number)}
                    className="min-w-[32px]"
                  >
                    {pageNum}
                  </Button>
                )
              )}

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
      </CardContent>
    </Card>
  );
}