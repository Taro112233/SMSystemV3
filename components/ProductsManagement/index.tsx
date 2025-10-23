// components/ProductsManagement/index.tsx
// ProductsManagement - Main orchestrator component with category support

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product } from '@prisma/client';
import { ProductFilters } from '@/lib/product-helpers';
import { CategoryWithOptions } from '@/lib/category-helpers';
import ProductsHeader from './ProductsHeader';
import ProductsTable from './ProductsTable';
import ProductForm from './ProductForm';
import ProductDetailDialog from './ProductDetailDialog';
import DeleteProductDialog from './DeleteProductDialog';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ProductsManagementProps {
  organizationId: string;
  orgSlug: string;
  userRole: string;
}

export default function ProductsManagement({
  organizationId,
  orgSlug,
  userRole,
}: ProductsManagementProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<CategoryWithOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    isActive: true,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Category filters
  const [categoryFilters, setCategoryFilters] = useState<{
    category1?: string;
    category2?: string;
    category3?: string;
  }>({});

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // ✅ แก้ไข: Convert to boolean explicitly และใช้ enum values ที่ถูกต้อง
  const canManage: boolean = Boolean(
    userRole && ['ADMIN', 'OWNER'].includes(userRole)
  );

  // ✅ เพิ่ม: Debug log เพื่อตรวจสอบ
  useEffect(() => {
    console.log('🔍 ProductsManagement - Role Check:', { 
      userRole, 
      canManage,
      roleType: typeof userRole,
      isAdmin: userRole === 'ADMIN',
      isOwner: userRole === 'OWNER',
    });
  }, [userRole, canManage]);

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

  // Fetch products
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
      
      // Add category filters
      if (categoryFilters.category1) params.append('category1', categoryFilters.category1);
      if (categoryFilters.category2) params.append('category2', categoryFilters.category2);
      if (categoryFilters.category3) params.append('category3', categoryFilters.category3);

      const response = await fetch(`/api/${orgSlug}/products?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('เกิดข้อผิดพลาด', {
        description: 'ไม่สามารถโหลดข้อมูลสินค้าได้',
      });
    } finally {
      setLoading(false);
    }
  }, [orgSlug, filters, categoryFilters]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handlers
  const handleCreateClick = () => {
    console.log('🔍 Create button clicked:', { canManage, userRole });
    if (!canManage) {
      toast.error('ไม่มีสิทธิ์', {
        description: 'เฉพาะ ADMIN และ OWNER เท่านั้นที่สร้างสินค้าได้',
      });
      return;
    }
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (product: any) => {
    // ✅ รองรับทั้ง edit จาก table และจาก detail dialog
    // ถ้าส่ง product เข้ามา ให้เปิด form, ถ้าไม่ได้ส่งค่ามา (กด save จาก dialog) ให้ refresh
    if (product) {
      if (!canManage) {
        toast.error('ไม่มีสิทธิ์', {
          description: 'เฉพาะ ADMIN และ OWNER เท่านั้นที่แก้ไขได้',
        });
        return;
      }
      setSelectedProduct(product);
      setIsFormOpen(true);
    } else {
      // Refresh products (called from ProductDetailDialog after save)
      fetchProducts();
    }
  };

  const handleViewClick = (product: any) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  const handleDeleteClick = (product: any) => {
    if (!canManage) {
      toast.error('ไม่มีสิทธิ์', {
        description: 'เฉพาะ ADMIN และ OWNER เท่านั้นที่ลบได้',
      });
      return;
    }
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  const handleToggleStatus = async (product: any, newStatus: boolean) => {
    console.log('🔍 Toggle status clicked:', { canManage, userRole, newStatus });
    
    if (!canManage) {
      toast.error('ไม่มีสิทธิ์', {
        description: 'เฉพาะ ADMIN และ OWNER เท่านั้นที่เปลี่ยนสถานะได้',
      });
      return;
    }

    try {
      const response = await fetch(`/api/${orgSlug}/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle status');
      }

      fetchProducts();
      toast.success('สำเร็จ', {
        description: `${newStatus ? 'เปิด' : 'ปิด'}ใช้งานสินค้าเรียบร้อย`,
      });
    } catch (error: any) {
      console.error('Error toggling status:', error);
      toast.error('เกิดข้อผิดพลาด', {
        description: error.message || 'ไม่สามารถเปลี่ยนสถานะได้',
      });
    }
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
  };

  const handleCategoryFilterChange = (filters: any) => {
    setCategoryFilters(filters);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <ProductsHeader
        onCreateClick={handleCreateClick}
        onSearchChange={(search: string) => handleFilterChange({ search })}
        canManage={canManage}
        searchValue={filters.search || ''}
      />

      {/* Table */}
      <ProductsTable
        products={products}
        categories={categories}
        loading={loading}
        filters={filters}
        categoryFilters={categoryFilters}
        onFilterChange={handleFilterChange}
        onCategoryFilterChange={handleCategoryFilterChange}
        onEditClick={handleEditClick}
        onViewClick={handleViewClick}
        onDeleteClick={handleDeleteClick}
        onToggleStatus={handleToggleStatus}
        canManage={canManage}
      />

      {/* Create/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <ProductForm
            organizationId={organizationId}
            orgSlug={orgSlug}
            categories={categories}
            product={selectedProduct}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Product Detail Dialog */}
      <ProductDetailDialog
        product={selectedProduct}
        categories={categories}
        orgSlug={orgSlug}
        canManage={canManage}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onEditClick={handleEditClick}
      />

      {/* Delete Confirmation Dialog */}
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