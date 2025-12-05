// components/TransferManagement/CreateTransfer/Step1BasicInfo.tsx
// Step1BasicInfo - Basic information step with transfer code

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TransferPriority } from '@/types/transfer';

interface Department {
  id: string;
  name: string;
  slug: string;
}

interface Step1FormData {
  transferCode: string;
  title: string;
  supplyingDepartmentId: string;
  requestReason: string;
  priority: TransferPriority;
  notes: string;
}

interface Step1BasicInfoProps {
  data: Step1FormData;
  departments: Department[];
  onChange: (data: Partial<Step1FormData>) => void;
}

const DEFAULT_REQUEST_REASON = 'ข้าพเจ้าขอเบิกเวชภัณฑ์/พัสดุตามรายการที่แนบมาเพื่อใช้งาน';

export default function Step1BasicInfo({
  data,
  departments,
  onChange,
}: Step1BasicInfoProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          ข้อมูลพื้นฐานใบเบิก
        </h3>
        <p className="text-sm text-gray-500">
          กรอกข้อมูลพื้นฐานของใบเบิกสินค้า
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* หัวข้อใบเบิก */}
        <div className="space-y-2">
          <Label htmlFor="title" className="required">
            หัวข้อใบเบิก <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            type="text"
            placeholder="เช่น ขอเบิกยาฉุกเฉิน"
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            required
          />
        </div>

        {/* เลขที่ใบเบิก */}
        <div className="space-y-2">
          <Label htmlFor="transferCode" className="required">
            เลขที่ใบเบิก <span className="text-red-500">*</span>
          </Label>
          <Input
            id="transferCode"
            type="text"
            placeholder="เช่น REQ-2025-0001"
            value={data.transferCode}
            onChange={(e) => onChange({ transferCode: e.target.value })}
            required
          />
        </div>

        {/* หน่วยงานที่จ่าย */}
        <div className="space-y-2">
          <Label htmlFor="supplyingDepartment" className="required">
            หน่วงานที่จ่าย <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.supplyingDepartmentId}
            onValueChange={(value) => onChange({ supplyingDepartmentId: value })}
          >
            <SelectTrigger id="supplyingDepartment">
              <SelectValue placeholder="เลือกหน่วยงาน" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ความสำคัญ */}
        <div className="space-y-2">
          <Label htmlFor="priority" className="required">
            ความสำคัญ <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.priority}
            onValueChange={(value: TransferPriority) =>
              onChange({ priority: value })
            }
          >
            <SelectTrigger id="priority">
              <SelectValue placeholder="เลือกความสำคัญ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NORMAL">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                  <span>ปกติ</span>
                </div>
              </SelectItem>
              <SelectItem value="URGENT">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400" />
                  <span>ด่วน</span>
                </div>
              </SelectItem>
              <SelectItem value="CRITICAL">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span>ด่วนมาก</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* เหตุผลในการขอเบิก */}
      <div className="space-y-2">
        <Label htmlFor="requestReason" className="required">
          เหตุผลในการขอเบิก <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="requestReason"
          placeholder={DEFAULT_REQUEST_REASON}
          value={data.requestReason || DEFAULT_REQUEST_REASON}
          onChange={(e) => onChange({ requestReason: e.target.value })}
          rows={3}
          required
        />
      </div>

      {/* หมายเหตุเพิ่มเติม */}
      <div className="space-y-2">
        <Label htmlFor="notes">หมายเหตุเพิ่มเติม</Label>
        <Textarea
          id="notes"
          placeholder="ข้อมูลเพิ่มเติม (ถ้ามี)"
          value={data.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  );
}