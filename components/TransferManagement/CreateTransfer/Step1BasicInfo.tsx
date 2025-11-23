// components/TransferManagement/CreateTransfer/Step1BasicInfo.tsx
// Step1BasicInfo - Basic information step

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TransferPriority } from '@/types/transfer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Department {
  id: string;
  name: string;
  slug: string;
}

export interface Step1Data {
  title: string;
  supplyingDepartmentId: string;
  requestReason: string;
  priority: TransferPriority;
  notes: string;
}

interface Step1BasicInfoProps {
  data: Step1Data;
  departments: Department[];
  onChange: (data: Partial<Step1Data>) => void;
}

export default function Step1BasicInfo({
  data,
  departments,
  onChange,
}: Step1BasicInfoProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">
          หัวข้อใบเบิก <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="ระบุหัวข้อใบเบิก"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="supplyingDepartment">
          หน่วยงานที่ขอเบิก <span className="text-red-500">*</span>
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

      <div className="space-y-2">
        <Label htmlFor="priority">
          ความสำคัญ <span className="text-red-500">*</span>
        </Label>
        <Select
          value={data.priority}
          onValueChange={(value) => onChange({ priority: value as TransferPriority })}
        >
          <SelectTrigger id="priority">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NORMAL">ปกติ</SelectItem>
            <SelectItem value="URGENT">ด่วน</SelectItem>
            <SelectItem value="CRITICAL">ด่วนมาก</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="requestReason">
          เหตุผลในการขอเบิก <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="requestReason"
          value={data.requestReason}
          onChange={(e) => onChange({ requestReason: e.target.value })}
          placeholder="ระบุเหตุผลในการขอเบิก"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">หมายเหตุเพิ่มเติม</Label>
        <Textarea
          id="notes"
          value={data.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
          rows={3}
        />
      </div>
    </div>
  );
}