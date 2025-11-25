// components/TransferManagement/TransferDetail/TransferHistoryTab.tsx
// TransferHistoryTab - History tab content

'use client';

import { TransferHistory, TransferItem } from '@/types/transfer';
import TransferHistoryTable from './TransferHistoryTable';
import { Card, CardContent } from '@/components/ui/card';

interface TransferHistoryTabProps {
  history: TransferHistory[];
  items?: TransferItem[]; // ✅ optional
}

export default function TransferHistoryTab({ history, items }: TransferHistoryTabProps) {
  return (
    <Card className="border-gray-200">
      <CardContent className="p-6">
        <TransferHistoryTable history={history} items={items} />
      </CardContent>
    </Card>
  );
}