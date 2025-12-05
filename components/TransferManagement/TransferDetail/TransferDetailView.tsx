// components/TransferManagement/TransferDetail/TransferDetailView.tsx
// TransferDetailView - FIXED: Use POST on main route instead of /approve-all

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Transfer, ApproveItemData, PrepareItemData, DeliverItemData, CancelItemData } from '@/types/transfer';
import TransferDetailHeader from './TransferDetailHeader';
import TransferStatusTimeline from './TransferStatusTimeline';
import TransferItemsTab from './TransferItemsTab';
import TransferHistoryTab from './TransferHistoryTab';
import TransferNotes from './TransferNotes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, History, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface TransferDetailViewProps {
  transferId: string;
  orgSlug: string;
  userDepartmentId: string;
}

export default function TransferDetailView({
  transferId,
  orgSlug,
  userDepartmentId,
}: TransferDetailViewProps) {
  const [loading, setLoading] = useState(true);
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [activeTab, setActiveTab] = useState('items');
  const [organizationRole, setOrganizationRole] = useState<'MEMBER' | 'ADMIN' | 'OWNER' | null>(null);

  const fetchUserRole = useCallback(async () => {
    try {
      const response = await fetch(`/api/auth/me?orgSlug=${orgSlug}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.permissions) {
          setOrganizationRole(data.data.permissions.currentRole);
        }
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  }, [orgSlug]);

  const fetchTransferDetail = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/${orgSlug}/transfers/${transferId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transfer');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch transfer');
      }

      setTransfer(data.data);
    } catch (error) {
      console.error('Error fetching transfer:', error);
      toast.error('เกิดข้อผิดพลาด', {
        description: 'ไม่สามารถโหลดข้อมูลใบเบิกได้',
      });
    } finally {
      setLoading(false);
    }
  }, [orgSlug, transferId]);

  useEffect(() => {
    fetchTransferDetail();
    fetchUserRole();
  }, [fetchTransferDetail, fetchUserRole]);

  const handleCancelTransfer = async () => {
    try {
      const reason = prompt('กรุณาระบุเหตุผลในการยกเลิก:');
      if (!reason) return;

      const response = await fetch(`/api/${orgSlug}/transfers/${transferId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel transfer');
      }

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

  const handleApproveAll = async () => {
    try {
      // ✅ FIXED: Use POST on main transfer route instead of /approve-all
      const response = await fetch(
        `/api/${orgSlug}/transfers/${transferId}`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to approve all items');
      }

      const data = await response.json();

      toast.success('สำเร็จ', {
        description: data.message || 'อนุมัติทุกรายการเรียบร้อย',
      });

      await fetchTransferDetail();
    } catch (error) {
      console.error('Error approving all items:', error);
      toast.error('เกิดข้อผิดพลาด', {
        description: 'ไม่สามารถอนุมัติได้',
      });
    }
  };

  const handleApproveItem = async (itemId: string, data: ApproveItemData) => {
    try {
      const response = await fetch(
        `/api/${orgSlug}/transfers/${transferId}/approve-item`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ itemId, ...data }),
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to approve item');
      }

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

  const handlePrepareItem = async (itemId: string, data: PrepareItemData) => {
    try {
      const response = await fetch(
        `/api/${orgSlug}/transfers/${transferId}/prepare-item`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ itemId, ...data }),
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to prepare item');
      }

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

  const handleDeliverItem = async (itemId: string, data: DeliverItemData) => {
    try {
      const response = await fetch(
        `/api/${orgSlug}/transfers/${transferId}/deliver-item`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ itemId, ...data }),
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to deliver item');
      }

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

  const handleCancelItem = async (itemId: string, data: CancelItemData) => {
    try {
      const response = await fetch(
        `/api/${orgSlug}/transfers/${transferId}/cancel-item`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ itemId, ...data }),
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to cancel item');
      }

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

  const userRole = transfer.requestingDepartmentId === userDepartmentId
    ? 'requesting'
    : transfer.supplyingDepartmentId === userDepartmentId
    ? 'supplying'
    : 'other';

  const canApprove = userRole === 'supplying' && organizationRole !== null;
  const canPrepare = userRole === 'supplying' && organizationRole !== null;
  const canReceive = userRole === 'requesting' && organizationRole !== null;
  const canCancel = organizationRole === 'ADMIN' || organizationRole === 'OWNER';

  return (
    <div className="space-y-6">
      <TransferDetailHeader
        transfer={transfer}
        canCancel={canCancel}
        canApprove={canApprove}
        onCancel={handleCancelTransfer}
        onApproveAll={handleApproveAll}
      />

      <TransferStatusTimeline
        status={transfer.status}
        requestedAt={transfer.requestedAt}
        approvedAt={transfer.approvedAt}
        preparedAt={transfer.preparedAt}
        deliveredAt={transfer.deliveredAt}
        cancelledAt={transfer.cancelledAt}
        items={transfer.items}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="items" className="gap-2">
            <Package className="h-4 w-4" />
            รายการสินค้า ({transfer.items.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            ประวัติการเปลี่ยนแปลง
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="mt-6">
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

        <TabsContent value="history" className="mt-6">
          <TransferHistoryTab 
            history={transfer.statusHistory || []} 
            items={transfer.items} />
        </TabsContent>
      </Tabs>

      <TransferNotes notes={transfer.notes} />
    </div>
  );
}