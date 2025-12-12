// components/ProductsManagement/index.tsx
// ProductsManagement - UPDATED: Add pagination

'use client';

import { useState, useEffect, useCallback } from 'react';
import { CategoryWithOptions } from '@/lib/category-helpers';
import { ProductUnit } from '@/types/product-unit';
import { ProductData, CategoryFiltersState } from '@/types/product';
import ProductsHeader from './ProductsHeader';
import ProductDetailDialog from './ProductDetailDialog';
import DeleteProductDialog from './DeleteProductDialog';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ProductFilters } from '@/lib/product-helpers';
import ProductsTable from './ProductsTable';
import ProductForm from './ProductForm';

interface ProductsManagementProps {
  orgSlug: string;
  userRole: string;
}

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export default function ProductsManagement({
  orgSlug,
  userRole,
}: ProductsManagementProps) {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<CategoryWithOptions[]>([]);
  const [productUnits, setProductUnits] = useState<ProductUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    isActive: true,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  const [categoryFilters, setCategoryFilters] = useState<CategoryFiltersState>({});

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);

  const canManage: boolean = Boolean(
    userRole && ['ADMIN', 'OWNER'].includes(userRole)
  );

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`/api/${orgSlug}/product-categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');

      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [orgSlug]);

  // Fetch product units
  const fetchProductUnits = useCallback(async () => {
    try {
      const response = await fetch(`/api/${orgSlug}/product-units`);
      if (!response.ok) throw new Error('Failed to fetch product units');

      const data = await response.json();
      const activeUnits = (data.units || []).filter((unit: ProductUnit) => unit.isActive);
      setProductUnits(activeUnits);
    } catch (error) {
      console.error('Error fetching product units:', error);
      toast.error('ไม่สามารถโหลดหน่วยนับได้');
    }
  }, [orgSlug]);

  // Fetch products with pagination
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.isActive !== null && filters.isActive !== undefined) {
        params.append('isActive', filters.isActive.toString());
      }
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      
      // Pagination params
      params.append('page', pagination.page.toString());
      params.append('pageSize', pagination.pageSize.toString());

      if (categoryFilters.category1) params.append('category1', categoryFilters.category1);
      if (categoryFilters.category2) params.append('category2', categoryFilters.category2);
      if (categoryFilters.category3) params.append('category3', categoryFilters.category3);

      const response = await fetch(`/api/${orgSlug}/products?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.data || []);
      
      if (data.pagination) {
        setPagination(prev => ({ ...prev, total: data.pagination.total }));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('เกิดข้อผิดพลาด', {
        description: 'ไม่สามารถโหลดข้อมูลสินค้าได้',
      });
    } finally {
      setLoading(false);
    }
  }, [orgSlug, filters, categoryFilters, pagination.page, pagination.pageSize]);

  useEffect(() => {
    fetchCategories();
    fetchProductUnits();
  }, [fetchCategories, fetchProductUnits]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handlers
  const handleCreateClick = () => {
    if (!canManage) {
      toast.error('ไม่มีสิทธิ์', {
        description: 'เฉพาะ ADMIN และ OWNER เท่านั้นที่สร้างสินค้าได้',
      });
      return;
    }
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (product: ProductData) => {
    if (!canManage) {
      toast.error('ไม่มีสิทธิ์', {
        description: 'เฉพาะ ADMIN และ OWNER เท่านั้นที่แก้ไขได้',
      });
      return;
    }
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleViewClick = (product: ProductData) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  const handleDeleteClick = (product: ProductData) => {
    if (!canManage) {
      toast.error('ไม่มีสิทธิ์', {
        description: 'เฉพาะ ADMIN และ OWNER เท่านั้นที่ลบได้',
      });
      return;
    }
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedProduct(null);
    fetchProducts();
    toast.success('สำเร็จ', {
      description: selectedProduct ? 'แก้ไขสินค้าเรียบร้อย' : 'สร้างสินค้าใหม่เรียบร้อย',
    });
  };

  const handleDeleteSuccess = () => {
    setIsDeleteOpen(false);
    setSelectedProduct(null);
    fetchProducts();
    toast.success('สำเร็จ', {
      description: 'ลบสินค้าเรียบร้อย',
    });
  };

  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCategoryFilterChange = (filters: CategoryFiltersState) => {
    setCategoryFilters(filters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize: newPageSize, page: 1 }));
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6">
      <ProductsHeader
        onCreateClick={handleCreateClick}
        onSearchChange={(search: string) => handleFilterChange({ search })}
        canManage={canManage}
        searchValue={filters.search || ''}
      />

      <ProductsTable
        products={products}
        categories={categories}
        productUnits={productUnits}
        orgSlug={orgSlug}
        loading={loading}
        filters={filters}
        categoryFilters={categoryFilters}
        pagination={pagination}
        onFilterChange={handleFilterChange}
        onCategoryFilterChange={handleCategoryFilterChange}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onEditClick={handleEditClick}
        onViewClick={handleViewClick}
        onDeleteClick={handleDeleteClick}
        canManage={canManage}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <ProductForm
            orgSlug={orgSlug}
            categories={categories}
            productUnits={productUnits}
            product={selectedProduct}
            onSuccess={handleFormSuccess}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      <ProductDetailDialog
        product={selectedProduct}
        categories={categories}
        productUnits={productUnits}
        orgSlug={orgSlug}
        canManage={canManage}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onEditClick={handleEditClick}
      />

      <DeleteProductDialog
        product={selectedProduct}
        orgSlug={orgSlug}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}