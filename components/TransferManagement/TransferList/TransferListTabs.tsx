// components/TransferManagement/TransferList/TransferListTabs.tsx
// TransferListTabs - Tabs: Outgoing | Incoming

'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface TransferListTabsProps {
  activeTab: 'outgoing' | 'incoming';
  onTabChange: (tab: 'outgoing' | 'incoming') => void;
  outgoingCount: number;
  incomingCount: number;
}

export default function TransferListTabs({
  activeTab,
  onTabChange,
  outgoingCount,
  incomingCount,
}: TransferListTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={(value: string) => onTabChange(value as 'outgoing' | 'incoming')}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="incoming" className="gap-2">
          <ArrowDownCircle className="h-4 w-4" />
          รายการรับเข้า ({incomingCount})
        </TabsTrigger>
        <TabsTrigger value="outgoing" className="gap-2">
          <ArrowUpCircle className="h-4 w-4" />
          รายการเบิกออก ({outgoingCount})
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}