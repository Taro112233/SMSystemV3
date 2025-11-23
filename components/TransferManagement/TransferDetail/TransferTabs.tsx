// components/TransferManagement/TransferDetail/TransferTabs.tsx
// TransferTabs - Tabs component

'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, History } from 'lucide-react';

interface TransferTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  itemsCount: number;
}

export default function TransferTabs({
  activeTab,
  onTabChange,
  itemsCount,
}: TransferTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="items" className="gap-2">
          <Package className="h-4 w-4" />
          รายการสินค้า ({itemsCount})
        </TabsTrigger>
        <TabsTrigger value="history" className="gap-2">
          <History className="h-4 w-4" />
          ประวัติการเปลี่ยนแปลง
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}