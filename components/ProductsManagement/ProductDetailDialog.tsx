// components/ProductsManagement/ProductDetailDialog.tsx
// ProductDetailDialog - Main dialog with stock and info tabs

'use client';

import { useState } from 'react';
import { CategoryWithOptions } from '@/lib/category-helpers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Info } from 'lucide-react';
import ProductInfoTab from './ProductDetailDialog/ProductInfoTab';
import StockSummaryTab from './ProductDetailDialog/StockSummaryTab';

// ✅ NEW: Add ProductUnit interface
interface ProductUnit {
  id: string;
  name: string;
  conversionRatio: number;
  isActive: boolean;
}

interface ProductDetailDialogProps {
  product: any | null;
  categories: CategoryWithOptions[];
  productUnits: ProductUnit[]; // ✅ NEW: Add productUnits prop
  orgSlug: string;
  canManage: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditClick: (product: any) => void;
}

export default function ProductDetailDialog({
  product,
  categories,
  productUnits, // ✅ NEW: Receive productUnits
  orgSlug,
  canManage,
  open,
  onOpenChange,
  onEditClick,
}: ProductDetailDialogProps) {
  const [activeTab, setActiveTab] = useState('stock');

  const handleSaveComplete = (updatedProduct: any) => {
    onEditClick(updatedProduct);
    onOpenChange(false);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            รายละเอียดสินค้า: {product.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stock">
              <Package className="h-4 w-4 mr-2" />
              จำนวนคงเหลือ
            </TabsTrigger>
            <TabsTrigger value="info">
              <Info className="h-4 w-4 mr-2" />
              ข้อมูลสินค้า
            </TabsTrigger>
          </TabsList>

          {/* Stock Summary Tab */}
          <TabsContent value="stock">
            <StockSummaryTab
              productId={product.id}
              productName={product.name}
              baseUnit={product.baseUnit}
              orgSlug={orgSlug}
            />
          </TabsContent>

          {/* Product Info Tab - ✅ UPDATED: Pass productUnits */}
          <TabsContent value="info">
            <ProductInfoTab
              product={product}
              categories={categories}
              productUnits={productUnits} // ✅ NEW: Pass preloaded units
              orgSlug={orgSlug}
              canManage={canManage}
              onSaveComplete={handleSaveComplete}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}