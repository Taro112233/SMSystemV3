// components/TransferManagement/shared/DepartmentSelectionDialog.tsx
// DepartmentSelectionDialog - UPDATED layout (Supplying → Requesting)

'use client';

import { Transfer } from '@/types/transfer';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Building2, ArrowRight } from 'lucide-react';
import DepartmentBadge from './DepartmentBadge';

interface DepartmentSelectionDialogProps {
  transfer: Transfer;
  orgSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DepartmentSelectionDialog({
  transfer,
  orgSlug,
  open,
  onOpenChange,
}: DepartmentSelectionDialogProps) {
  const router = useRouter();

  const handleSelectDepartment = (departmentSlug: string) => {
    router.push(`/${orgSlug}/${departmentSlug}/transfers/${transfer.id}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            เลือกมุมมองหน่วยงาน
          </DialogTitle>
          <DialogDescription>
            เลือกว่าต้องการดูใบเบิกนี้จากมุมมองของหน่วยงานไหน
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Transfer Info */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm font-medium text-gray-700 mb-2">
              ใบเบิกหมายเลข
            </div>
            <div className="font-mono font-semibold text-blue-600 text-lg">
              {transfer.code}
            </div>
            <div className="text-sm text-gray-900 mt-1">{transfer.title}</div>
          </div>

          {/* ✅ Department Flow: Supplying → Arrow → Requesting */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
            {/* ✅ LEFT: Supplying Department (ผู้ให้) */}
            <Button
              variant="outline"
              onClick={() => handleSelectDepartment(transfer.supplyingDepartment.slug)}
              className="h-auto p-6 flex flex-col items-start gap-3 hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center gap-2 text-blue-700">
                <span className="font-semibold">หน่วยงานผู้ให้</span>
              </div>
              
              <div className="w-full">
                <DepartmentBadge 
                  name={transfer.supplyingDepartment.name}
                  className="w-full justify-center bg-blue-50 text-blue-800 border-blue-200"
                />
              </div>

              <div className="text-xs text-gray-600 text-left space-y-1">
                <div>• อนุมัติคำขอ</div>
                <div>• จัดเตรียมสินค้า</div>
                <div>• เลือก Batch และจำนวน</div>
              </div>

              <div className="text-xs font-medium text-blue-600 mt-auto">
                (Supplying)
              </div>
            </Button>

            {/* ✅ CENTER: Arrow */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-green-100 rounded-full flex items-center justify-center">
                <ArrowRight className="w-8 h-8 text-gray-600" />
              </div>
              <div className="text-xs text-gray-500 font-medium whitespace-nowrap">
                โอนย้าย
              </div>
            </div>

            {/* ✅ RIGHT: Requesting Department (ผู้รับ) */}
            <Button
              variant="outline"
              onClick={() => handleSelectDepartment(transfer.requestingDepartment.slug)}
              className="h-auto p-6 flex flex-col items-start gap-3 hover:bg-green-50 hover:border-green-300 transition-colors"
            >
              <div className="flex items-center gap-2 text-green-700">
                <span className="font-semibold">หน่วยงานผู้รับ</span>
              </div>
              
              <div className="w-full">
                <DepartmentBadge 
                  name={transfer.requestingDepartment.name} 
                  className="w-full justify-center bg-green-50 text-green-800 border-green-200"
                />
              </div>

              <div className="text-xs text-gray-600 text-left space-y-1">
                <div>• ดูสถานะการขอเบิก</div>
                <div>• รับเข้าสินค้า</div>
                <div>• ตรวจสอบรายการที่ได้รับ</div>
              </div>

              <div className="text-xs font-medium text-green-600 mt-auto">
                (Requesting)
              </div>
            </Button>
          </div>

          {/* Info Message */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              💡 <strong>หมายเหตุ:</strong> การดำเนินการที่ทำได้จะขึ้นอยู่กับหน่วยงานที่คุณเลือก
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}