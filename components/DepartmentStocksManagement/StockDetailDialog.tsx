// components/DepartmentStocksManagement/StockDetailDialog.tsx
// FIXED: Pass entire stock object to ProductInfoTab

'use client';

import { useState } from 'react';
import { DepartmentStock } from '@/types/stock';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Info } from 'lucide-react';
import BatchManagementTab from './StockDetailDialog/BatchManagementTab';
import ProductInfoTab from './StockDetailDialog/ProductInfoTab';

interface StockDetailDialogProps {
  stock: DepartmentStock | null;
  orgSlug: string;
  deptSlug: string;
  canManage: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateSuccess: () => void;
}

export default function StockDetailDialog({
  stock,
  orgSlug,
  deptSlug,
  canManage,
  open,
  onOpenChange,
  onUpdateSuccess,
}: StockDetailDialogProps) {
  const [activeTab, setActiveTab] = useState('batches');

  if (!stock) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            จัดการสต็อก: {stock.product.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="batches">
              <Package className="h-4 w-4 mr-2" />
              จัดการ Batch/Lot
            </TabsTrigger>
            <TabsTrigger value="info">
              <Info className="h-4 w-4 mr-2" />
              ข้อมูลสินค้า
            </TabsTrigger>
          </TabsList>

          <TabsContent value="batches">
            <BatchManagementTab
              stock={stock}
              orgSlug={orgSlug}
              deptSlug={deptSlug}
              canManage={canManage}
              onUpdateSuccess={onUpdateSuccess}
            />
          </TabsContent>

          <TabsContent value="info">
            <ProductInfoTab
              stock={stock}
              orgSlug={orgSlug}
              deptSlug={deptSlug}
              canManage={canManage}
              onUpdateSuccess={onUpdateSuccess}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}