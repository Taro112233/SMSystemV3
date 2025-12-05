// components/TransferManagement/TransferDetail/TransferDetailHeader.tsx
// TransferDetailHeader - UPDATED with Approve All + conditional Cancel

'use client';

import { Transfer } from '@/types/transfer';
import TransferStatusBadge from '../shared/TransferStatusBadge';
import TransferPriorityBadge from '../shared/TransferPriorityBadge';
import { Button } from '@/components/ui/button';
import { ArrowRight, XCircle, CheckCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TransferDetailHeaderProps {
  transfer: Transfer;
  canCancel: boolean;
  canApprove: boolean;
  onCancel: () => void;
  onApproveAll: () => void;
}

export default function TransferDetailHeader({
  transfer,
  canCancel,
  canApprove,
  onCancel,
  onApproveAll,
}: TransferDetailHeaderProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Show cancel only if not approved yet
  const showCancel = canCancel && 
                     transfer.status !== 'CANCELLED' && 
                     transfer.status !== 'COMPLETED' &&
                     !transfer.approvedAt;

  // Show approve all if there are pending items
  const hasPendingItems = transfer.items.some(item => item.status === 'PENDING');
  const showApproveAll = canApprove && hasPendingItems;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="grid grid-cols-3 gap-4">
        {/* Row 1: เลขที่ | สถานะ | ปุ่มดำเนินการ */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">เลขที่:</span>
          <span className="font-mono font-semibold text-lg text-blue-600">{transfer.code}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">สถานะ:</span>
          <TransferStatusBadge status={transfer.status} />
        </div>

        <div className="flex items-center justify-end gap-2">
          {showApproveAll && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="default" size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <CheckCircle className="h-4 w-4" />
                  อนุมัติทั้งหมด
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>ยืนยันอนุมัติทั้งหมด</AlertDialogTitle>
                  <AlertDialogDescription>
                    คุณต้องการอนุมัติทุกรายการในใบเบิกนี้ใช่หรือไม่? ระบบจะอนุมัติตามจำนวนที่ขอเบิกทั้งหมด
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                  <AlertDialogAction onClick={onApproveAll}>ยืนยัน</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          
          {showCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-2">
                  <XCircle className="h-4 w-4" />
                  ยกเลิก
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>ยืนยันการยกเลิกใบเบิก</AlertDialogTitle>
                  <AlertDialogDescription>
                    คุณแน่ใจหรือไม่ที่จะยกเลิกใบเบิกนี้? การกระทำนี้ไม่สามารถย้อนกลับได้
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                  <AlertDialogAction onClick={onCancel}>ยืนยัน</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Row 2: ชื่อใบเบิก | ความเร่งด่วน | เบิกจาก */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">ชื่อใบเบิก:</span>
          <span className="text-xl font-bold text-gray-900">{transfer.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">ความเร่งด่วน:</span>
          <TransferPriorityBadge priority={transfer.priority} />
        </div>

        <div className="flex items-center gap-2 justify-end">
          <span className="text-sm font-medium text-gray-600">เบิกจาก:</span>
          <span className="font-medium text-gray-900">{transfer.supplyingDepartment.name}</span>
          <ArrowRight className="w-4 h-4 text-gray-400 mx-1" />
          <span className="font-medium text-gray-900">{transfer.requestingDepartment.name}</span>
        </div>

        {/* Row 3: สร้างเมื่อ | เหตุผล (col-span-2) */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">สร้างเมื่อ:</span>
          <span className="text-sm text-gray-900">{formatDate(transfer.requestedAt)}</span>
        </div>

        {transfer.requestReason && (
          <div className="col-span-2 flex items-start gap-2">
            <span className="text-sm font-medium text-gray-600">เหตุผล:</span>
            <span className="text-sm text-gray-900">{transfer.requestReason}</span>
          </div>
        )}
      </div>
    </div>
  );
}