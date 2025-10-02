// components/DepartmentDashboard/DepartmentInfo.tsx
// DepartmentView/DepartmentInfo - Department details, team info and performance metrics

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface DepartmentInfoProps {
  department: {
    code: string;
    manager: string;
    lastActivity: string;
  };
}

export const DepartmentInfo = ({ department }: DepartmentInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ข้อมูลหน่วยงาน</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">รายละเอียด</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">รหัสหน่วยงาน:</span>
                <span className="font-mono">{department.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ผู้จัดการ:</span>
                <span>{department.manager}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">กิจกรรมล่าสุด:</span>
                <span>{department.lastActivity}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">สถิติ</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">อัตราการใช้สต็อก:</span>
                <span className="text-green-600">85%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ความถูกต้องสต็อก:</span>
                <span className="text-blue-600">98.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">การเบิกเฉลี่ย/วัน:</span>
                <span>12 รายการ</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};