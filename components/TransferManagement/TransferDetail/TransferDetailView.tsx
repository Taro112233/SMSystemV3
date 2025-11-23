// components/TransferManagement/TransferDetail/TransferDetailView.tsx
// TransferDetailView - Main detail container

'use client';

import { useState, useEffect } from 'react';
import { Transfer, TransferHistory } from '@/types/transfer';
import TransferDetailHeader from './TransferDetailHeader';
import TransferStatusTimeline from './TransferStatusTimeline';
import TransferTabs from './TransferTabs';
import TransferItemsTab from './TransferItemsTab';
import TransferHistoryTab from './TransferHistoryTab';
import TransferNotes from './TransferNotes';
import { TabsContent } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface TransferDetailViewProps {
  transferId: string;
  orgSlug: string;
  deptSlug: string;
  userDepartmentId: string;
}

export default function TransferDetailView({
  transferId,
  orgSlug,
  deptSlug,
  userDepartmentId,
}: TransferDetailViewProps) {
  const [loading, setLoading] = useState(true);
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [history, setHistory] = useState<TransferHistory[]>([]);
  const [activeTab, setActiveTab] = useState('items');

  // Determine user role
  const userRole = transfer
    ? transfer.requestingDepartmentId === userDepartmentId
      ? 'requesting'
      : transfer.supplyingDepartmentId === userDepartmentId
      ? 'supplying'
      : 'other'
    : 'other';

  // Permission checks (simplified - should come from API)
  const canApprove = userRole === 'supplying';
  const canPrepare = userRole === 'supplying';
  const canReceive = userRole === 'requesting';
  const canCancel = true; // ADMIN/OWNER only in real implementation

  useEffect(() => {
    fetchTransferDetail();
  }, [transferId]);

  const fetchTransferDetail = async () => {
    try {
      setLoading(true);

      // TODO: Implement API call
      // const response = await fetch(`/api/${orgSlug}/transfers/${transferId}`);
      // const data = await response.json();
      // setTransfer(data.transfer);
      // setHistory(data.history);

      // Mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500));
      setTransfer(null);
      setHistory([]);
    } catch (error) {
      console.error('Error fetching transfer:', error);
      toast.error('เกิดข้อผิดพลาด', {
        description: 'ไม่สามารถโหลดข้อมูลใบเบิกได้',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTransfer = async () => {
    try {
      // TODO: Implement API call
      // await fetch(`/api/${orgSlug}/transfers/${transferId}`, {
      //   method: 'DELETE',
      // });

      toast.success('สำเร็จ', {
        description: 'ยกเลิกใบเบิกเรียบร้อย',
      });

      await fetchTransferDetail();
    } catch (error) {
      console.error('Error cancelling transfer:', error);
      toast.error('เกิดข้อผิดพลาด', {
        description: 'ไม่สามารถยกเลิกใบเบิกได้',
      });
    }
  };

  const handleApproveItem = async (itemId: string, data: any) => {
    try {
      // TODO: Implement API call
      // await fetch(`/api/${orgSlug}/transfers/${transferId}/approve-item`, {
      //   method: 'POST',
      //   body: JSON.stringify({ itemId, ...data }),
      // });

      toast.success('สำเร็จ', {
        description: 'อนุมัติรายการเรียบร้อย',
      });

      await fetchTransferDetail();
    } catch (error) {
      console.error('Error approving item:', error);
      toast.error('เกิดข้อผิดพลาด', {
        description: 'ไม่สามารถอนุมัติรายการได้',
      });
    }
  };

  const handlePrepareItem = async (itemId: string, data: any) => {
    try {
      // TODO: Implement API call
      // await fetch(`/api/${orgSlug}/transfers/${transferId}/prepare-item`, {
      //   method: 'POST',
      //   body: JSON.stringify({ itemId, ...data }),
      // });

      toast.success('สำเร็จ', {
        description: 'จัดเตรียมรายการเรียบร้อย',
      });

      await fetchTransferDetail();
    } catch (error) {
      console.error('Error preparing item:', error);
      toast.error('เกิดข้อผิดพลาด', {
        description: 'ไม่สามารถจัดเตรียมรายการได้',
      });
    }
  };

  const handleDeliverItem = async (itemId: string, data: any) => {
    try {
      // TODO: Implement API call
      // await fetch(`/api/${orgSlug}/transfers/${transferId}/deliver-item`, {
      //   method: 'POST',
      //   body: JSON.stringify({ itemId, ...data }),
      // });

      toast.success('สำเร็จ', {
        description: 'รับเข้ารายการเรียบร้อย',
      });

      await fetchTransferDetail();
    } catch (error) {
      console.error('Error delivering item:', error);
      toast.error('เกิดข้อผิดพลาด', {
        description: 'ไม่สามารถรับเข้ารายการได้',
      });
    }
  };

  const handleCancelItem = async (itemId: string, data: any) => {
    try {
      // TODO: Implement API call
      // await fetch(`/api/${orgSlug}/transfers/${transferId}/cancel-item`, {
      //   method: 'POST',
      //   body: JSON.stringify({ itemId, ...data }),
      // });

      toast.success('สำเร็จ', {
        description: 'ยกเลิกรายการเรียบร้อย',
      });

      await fetchTransferDetail();
    } catch (error) {
      console.error('Error cancelling item:', error);
      toast.error('เกิดข้อผิดพลาด', {
        description: 'ไม่สามารถยกเลิกรายการได้',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">ไม่พบข้อมูลใบเบิก</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TransferDetailHeader
        transfer={transfer}
        canCancel={canCancel}
        onCancel={handleCancelTransfer}
      />

      <TransferStatusTimeline
        status={transfer.status}
        requestedAt={transfer.requestedAt}
        approvedAt={transfer.approvedAt}
        preparedAt={transfer.preparedAt}
        deliveredAt={transfer.deliveredAt}
        cancelledAt={transfer.cancelledAt}
      />

      <TransferTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        itemsCount={transfer.items.length}
      />

      {activeTab === 'items' ? (
        <TabsContent value="items">
          <TransferItemsTab
            items={transfer.items}
            userRole={userRole}
            canApprove={canApprove}
            canPrepare={canPrepare}
            canReceive={canReceive}
            canCancel={canCancel}
            onApprove={handleApproveItem}
            onPrepare={handlePrepareItem}
            onDeliver={handleDeliverItem}
            onCancelItem={handleCancelItem}
          />
        </TabsContent>
      ) : (
        <TabsContent value="history">
          <TransferHistoryTab history={history} />
        </TabsContent>
      )}

      <TransferNotes notes={transfer.notes} />
    </div>
  );
}