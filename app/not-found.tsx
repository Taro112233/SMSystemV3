// app/not-found.tsx
// InvenStock - Not Found Page

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Home, ArrowLeft, Building2 } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900">InvenStock</h1>
              <p className="text-sm text-gray-600">Multi-Tenant Inventory System</p>
            </div>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              
              {/* Icon */}
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-12 h-12 text-red-500" />
                </div>
              </div>
              
              {/* Title & Message */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  ไม่พบหน้าที่ต้องการ
                </h2>
                <p className="text-gray-600">
                  หน้าที่คุณต้องการอาจไม่มีอยู่ หรือคุณไม่มีสิทธิ์เข้าถึงองค์กรนี้
                </p>
              </div>
              
              {/* Possible Reasons */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
                <h3 className="font-semibold text-amber-800 mb-2">สาเหตุที่เป็นไปได้:</h3>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• URL ไม่ถูกต้องหรือพิมพ์ผิด</li>
                  <li>• คุณไม่ได้เป็นสมาชิกขององค์กรนี้</li>
                  <li>• องค์กรถูกลบหรือระงับการใช้งาน</li>
                  <li>• ลิงก์หมดอายุหรือไม่ถูกต้อง</li>
                </ul>
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-3">
                <Link href="/dashboard">
                  <Button className="w-full" size="lg">
                    <Home className="w-4 h-4 mr-2" />
                    กลับไปหน้าเลือกองค์กร
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.history.length > 1) {
                      window.history.back();
                    } else {
                      window.location.href = '/dashboard';
                    }
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  กลับหน้าก่อนหน้า
                </Button>
              </div>
              
              {/* Help Text */}
              <div className="text-sm text-gray-500 pt-4 border-t border-gray-200">
                <p>
                  หากคุณคิดว่านี่เป็นข้อผิดพลาด กรุณาติดต่อผู้ดูแลระบบ
                  <br />
                  หรือตรวจสอบรหัสเชิญเข้าองค์กร
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>InvenStock - Multi-Tenant Inventory Management</p>
          <p>© 2025 - Enterprise Grade Solution</p>
        </div>
      </div>
    </div>
  );
}