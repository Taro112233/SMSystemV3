// components/ProductsManagement/ProductDetailDialog.tsx
// ProductDetailDialog - UPDATED: Add animations

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
import ProductInfoTab from './ProductDetailDialog/ProductInfoTab';
import StockSummaryTab from './ProductDetailDialog/StockSummaryTab';
import { motion, AnimatePresence } from 'framer-motion';

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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
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

              <AnimatePresence mode="wait">
                <TabsContent value="stock" key="stock">
                  {activeTab === 'stock' && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <StockSummaryTab
                        productId={product.id}
                        orgSlug={orgSlug}
                        baseUnit={product.baseUnit}
                      />
                    </motion.div>
                  )}
                </TabsContent>

                <TabsContent value="info" key="info">
                  {activeTab === 'info' && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ProductInfoTab
                        product={product}
                        categories={categories}
                        productUnits={productUnits}
                        orgSlug={orgSlug}
                        canManage={canManage}
                        onSaveComplete={handleSaveComplete}
                      />
                    </motion.div>
                  )}
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}