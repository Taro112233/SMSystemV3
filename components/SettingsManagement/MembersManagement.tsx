// components/SettingsManagement/MembersManagement.tsx
// SettingsManagement/MembersManagement - Organization members management

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Lock, Info } from 'lucide-react';

interface MembersManagementProps {
  organizationId: string;
  organizationSlug: string;
  userRole: 'MEMBER' | 'ADMIN' | 'OWNER';
}

export const MembersManagement = ({
  organizationId,
  organizationSlug,
  userRole
}: MembersManagementProps) => {
  const canManage = ['ADMIN', 'OWNER'].includes(userRole);

  return (
    <div className="space-y-6">
      {/* Permission Alert */}
      {!canManage && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            คุณไม่มีสิทธิ์จัดการสมาชิก ต้องเป็น ADMIN หรือ OWNER เท่านั้น
          </AlertDescription>
        </Alert>
      )}

      {/* Coming Soon Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            จัดการสมาชิกองค์กร
          </CardTitle>
          <CardDescription>
            จัดการสมาชิก บทบาท และสิทธิ์การเข้าถึงในองค์กร
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ฟีเจอร์กำลังพัฒนา
            </h3>
            <p className="text-gray-600 mb-4">
              ระบบจัดการสมาชิกจะเปิดให้ใช้งานในเร็วๆ นี้
            </p>
            <div className="text-sm text-gray-500">
              <p>ฟีเจอร์ที่กำลังพัฒนา:</p>
              <ul className="mt-2 space-y-1">
                <li>• ดูรายชื่อสมาชิกทั้งหมด</li>
                <li>• เปลี่ยนบทบาทสมาชิก (MEMBER/ADMIN/OWNER)</li>
                <li>• ระงับหรือลบสมาชิก</li>
                <li>• ดูประวัติการเข้าใช้งาน</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};