// components/TransferManagement/CreateTransfer/Step3ReviewSubmit.tsx
// Step3ReviewSubmit - UPDATED: Add transferCode display

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TransferPriority } from '@/types/transfer';
import TransferPriorityBadge from '../shared/TransferPriorityBadge';

interface Step1Data {
  transferCode: string;
  title: string;
  supplyingDepartmentId: string;
  requestReason: string;
  priority: TransferPriority;
  notes: string;
}

interface SelectedProduct {
  id: string;
  code: string;
  name: string;
  baseUnit: string;
  quantity: number;
  notes?: string;
}

interface Step3ReviewSubmitProps {
  step1Data: Step1Data;
  selectedProducts: SelectedProduct[];
  supplyingDepartmentName: string;
  requestingDepartmentName: string;
}

export default function Step3ReviewSubmit({
  step1Data,
  selectedProducts,
  supplyingDepartmentName,
  requestingDepartmentName,
}: Step3ReviewSubmitProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          ตรวจสอบข้อมูลก่อนส่งใบเบิก
        </h3>
        <p className="text-sm text-gray-500">
          โปรดตรวจสอบความถูกต้องของข้อมูลก่อนส่งใบเบิก
        </p>
      </div>

      {/* Transfer Info */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h4 className="font-semibold text-gray-900">{step1Data.title}</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  เลขที่: <span className="font-mono font-medium text-blue-600">{step1Data.transferCode}</span>
                </span>
                <span className="text-gray-300">•</span>
                <TransferPriorityBadge priority={step1Data.priority} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-600">หน่วยงานที่ขอเบิก</p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {requestingDepartmentName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">หน่วยงานที่จ่าย</p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {supplyingDepartmentName}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600">เหตุผลในการขอเบิก</p>
            <p className="text-sm text-gray-900 mt-1">{step1Data.requestReason}</p>
          </div>

          {step1Data.notes && (
            <div>
              <p className="text-sm text-gray-600">หมายเหตุ</p>
              <p className="text-sm text-gray-900 mt-1">{step1Data.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Items List */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4">
            รายการสินค้า ({selectedProducts.length} รายการ)
          </h4>

          <div className="space-y-3">
            {selectedProducts.map((product) => (
              <div
                key={product.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-blue-600">
                        {product.code}
                      </span>
                      <span className="text-sm text-gray-900">{product.name}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <div>
                        <span className="font-medium">จำนวนเบิก:</span>{' '}
                        <span className="text-blue-600 font-semibold">
                          {product.quantity.toLocaleString()} {product.baseUnit}
                        </span>
                      </div>
                    </div>

                    {product.notes && (
                      <p className="text-xs text-gray-600">
                        หมายเหตุ: {product.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}