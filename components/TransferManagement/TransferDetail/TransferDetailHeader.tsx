// components/TransferManagement/TransferDetail/TransferDetailHeader.tsx
// TransferDetailHeader - Header section

'use client';

import { Transfer } from '@/types/transfer';
import TransferCodeDisplay from '../shared/TransferCodeDisplay';
import TransferStatusBadge from '../shared/TransferStatusBadge';
import TransferPriorityBadge from '../shared/TransferPriorityBadge';
import DepartmentBadge from '../shared/DepartmentBadge';
import { Button } from '@/components/ui/button';
import { ArrowRight, XCircle } from 'lucide-react';
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
  onCancel: () => void;
}

export default function TransferDetailHeader({
  transfer,
  canCancel,
  onCancel,
}: TransferDetailHeaderProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-4 flex-1">
          {/* Code & Title */}
          <div>
            <TransferCodeDisplay code={transfer.code} className="text-lg" />
            <h2 className="text-2xl font-bold text-gray-900 mt-1">
              {transfer.title}
            </h2>
          </div>

          {/* Status & Priority */}
          <div className="flex items-center gap-3">
            <TransferStatusBadge status={transfer.status} />
            <TransferPriorityBadge priority={transfer.priority} />
          </div>

          {/* Departments */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">จาก:</span>
              <DepartmentBadge name={transfer.supplyingDepartment.name} />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">ถึง:</span>
              <DepartmentBadge name={transfer.requestingDepartment.name} />
            </div>
          </div>

          {/* Request Reason */}
          {transfer.requestReason && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">
                เหตุผลในการขอเบิก
              </div>
              <div className="text-sm text-gray-900 p-3 bg-blue-50 rounded-lg border border-blue-200">
                {transfer.requestReason}
              </div>
            </div>
          )}

          {/* Date Info */}
          <div className="text-sm text-gray-600">
            สร้างเมื่อ {formatDate(transfer.requestedAt)}
          </div>
        </div>

        {/* Cancel Button */}
        {canCancel && transfer.status !== 'CANCELLED' && transfer.status !== 'COMPLETED' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-2">
                <XCircle className="h-4 w-4" />
                ยกเลิกใบเบิก
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
                <AlertDialogAction onClick={onCancel}>
                  ยืนยันการยกเลิก
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}