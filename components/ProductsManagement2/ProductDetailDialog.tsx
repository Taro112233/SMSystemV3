// components/ProductsManagement2/ProductDetailDialog.tsx
// ProductDetailDialog - Product detail with tabs

'use client';

import { useState } from 'react';
import { CategoryWithOptions } from '@/lib/category-helpers';
import { ProductUnit } from '@/types/product-unit';
import { ProductData } from '@/types/product';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Info } from 'lucide-react';
import ProductInfoTab from './ProductInfoTab';
import StockSummaryTab from './StockSummaryTab';

interface ProductDetailDialogProps {
  product: ProductData | null;
  categories: CategoryWithOptions[];
  productUnits: ProductUnit[];
  orgSlug: string;
  canManage: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditClick: (product: ProductData) => void;
}

export default function ProductDetailDialog({
  product,
  categories,
  productUnits,
  orgSlug,
  canManage,
  open,
  onOpenChange,
  onEditClick,
}: ProductDetailDialogProps) {
  const [activeTab, setActiveTab] = useState('stock');

  const handleSaveComplete = (updatedProduct: ProductData) => {
    onEditClick(updatedProduct);
    onOpenChange(false);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            {product.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stock" className="text-sm">
              <Package className="h-4 w-4 mr-2" />
              คงเหลือ
            </TabsTrigger>
            <TabsTrigger value="info" className="text-sm">
              <Info className="h-4 w-4 mr-2" />
              ข้อมูล
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stock">
            <StockSummaryTab
              productId={product.id}
              orgSlug={orgSlug}
              baseUnit={product.baseUnit}
            />
          </TabsContent>

          <TabsContent value="info">
            <ProductInfoTab
              product={product}
              categories={categories}
              productUnits={productUnits}
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