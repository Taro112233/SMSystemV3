// components/TransferManagement/TransferDetail/TransferHeader.tsx
// TransferHeader - Compact header with key info

'use client';

import { Transfer } from '@/types/transfer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, ArrowRight, AlertCircle } from 'lucide-react';
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

interface TransferHeaderProps {
  transfer: Transfer;
  canCancel: boolean;
  canApprove: boolean;
  onCancel: () => void;
  onApproveAll: () => void;
}

export default function TransferHeader({
  transfer,
  canCancel,
  canApprove,
  onCancel,
  onApproveAll,
}: TransferHeaderProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    APPROVED: 'bg-blue-100 text-blue-800 border-blue-200',
    PREPARED: 'bg-purple-100 text-purple-800 border-purple-200',
    DELIVERED: 'bg-green-100 text-green-800 border-green-200',
    PARTIAL: 'bg-orange-100 text-orange-800 border-orange-200',
    COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  };

  const statusLabels = {
    PENDING: 'รออนุมัติ',
    APPROVED: 'อนุมัติแล้ว',
    PREPARED: 'จัดเตรียมแล้ว',
    DELIVERED: 'รับเข้าแล้ว',
    PARTIAL: 'รับบางส่วน',
    COMPLETED: 'เสร็จสมบูรณ์',
    CANCELLED: 'ยกเลิก',
  };

  const priorityColors = {
    NORMAL: 'bg-gray-100 text-gray-800 border-gray-200',
    URGENT: 'bg-orange-100 text-orange-800 border-orange-200',
    CRITICAL: 'bg-red-100 text-red-800 border-red-200',
  };

  const priorityLabels = {
    NORMAL: 'ปกติ',
    URGENT: 'ด่วน',
    CRITICAL: 'ด่วนมาก',
  };

  const showCancel = canCancel && 
    transfer.status !== 'CANCELLED' && 
    transfer.status !== 'COMPLETED' &&
    !transfer.approvedAt;

  const hasPendingItems = transfer.items.some(item => item.status === 'PENDING');
  const showApproveAll = canApprove && hasPendingItems;

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Top Section: Code + Status + Actions */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">เลขที่ใบเบิก</div>
              <div className="font-mono text-2xl font-bold text-blue-600">{transfer.code}</div>
            </div>
            <div className="h-12 w-px bg-gray-200" />
            <div>
              <div className="text-xs text-gray-500 mb-1">สถานะ</div>
              <Badge variant="outline" className={`${statusColors[transfer.status]} font-medium`}>
                {statusLabels[transfer.status]}
              </Badge>
            </div>
            <div className="h-12 w-px bg-gray-200" />
            <div>
              <div className="text-xs text-gray-500 mb-1">ความเร่งด่วน</div>
              <Badge variant="outline" className={`${priorityColors[transfer.priority]} font-medium`}>
                {transfer.priority === 'URGENT' && <AlertCircle className="h-3 w-3 mr-1" />}
                {transfer.priority === 'CRITICAL' && <AlertCircle className="h-3 w-3 mr-1" />}
                {priorityLabels[transfer.priority]}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showApproveAll && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" className="gap-2">
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
                    <AlertDialogAction onClick={onCancel} className="bg-red-600 hover:bg-red-700">
                      ยืนยันยกเลิก
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Details */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-xs text-gray-500 mb-1">ชื่อใบเบิก</div>
            <div className="text-lg font-semibold text-gray-900">{transfer.title}</div>
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-1">การโอนย้าย</div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-900">{transfer.supplyingDepartment.name}</span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-gray-900">{transfer.requestingDepartment.name}</span>
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-1">สร้างเมื่อ</div>
            <div className="text-sm text-gray-900">{formatDate(transfer.requestedAt)}</div>
          </div>

          {transfer.requestReason && (
            <div>
              <div className="text-xs text-gray-500 mb-1">เหตุผลในการเบิก</div>
              <div className="text-sm text-gray-900">{transfer.requestReason}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}