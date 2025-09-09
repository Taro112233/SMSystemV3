// app/page.tsx
// Hospital Pharmacy Stock Management System V3.0 - Landing Page
// Branch PDF Print

'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Pill, 
  Building2, 
  Users, 
  Shield, 
  Smartphone, 
  Clock,
  Activity,
  CheckCircle,
  LogIn,
  Bell,
  Download,
  History,
  Eye,
  BookIcon
} from 'lucide-react';

export default function LandingPage() {
  const [showManual, setShowManual] = useState(false);

  const handleManualClick = async () => {
    try {
      // Call logout API to clear HTTP-only cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include' // รวม cookies ในการเรียก API
      })
      
      // Clear any client-side storage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      sessionStorage.clear()
      
      // Clear all cookies on client side
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
      });
      
      console.log('All cookies and storage cleared for manual access')
      
    } catch (error) {
      console.error('Error clearing cookies:', error)
      
      // Clear client-side storage even if API fails
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      sessionStorage.clear()
      
      // Clear cookies even if API fails
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
      });
    }
    
    // Show manual after clearing
    setShowManual(true);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Hospital Pharmacy</h1>
                <p className="text-sm text-gray-600">Stock Management System V3.0</p>
              </div>
            </div>
            
            <Link href="/dashboard">
              <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                <LogIn className="w-4 h-4" />
                เข้าสู่ระบบ
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            สำหรับโรงพยาบาล เภสัชกร และเจ้าหน้าที่
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            ระบบจัดการ
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">สต็อกยา</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            ติดตามสต็อกยา แจ้งเตือนยาใกล้หมด และตรวจเช็คสต็อกผ่านมือถือ
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-4 w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                <Building2 className="w-5 h-5 mr-2" />
                เริ่มใช้งานระบบ
              </Button>
            </Link>
            
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 w-full sm:w-auto border-blue-200 hover:bg-blue-50" onClick={handleManualClick}>
              <BookIcon className="w-5 h-5 mr-2" />
              ดูคู่มือการใช้งาน
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-blue-600">2</div>
              <div className="text-sm text-gray-600">แผนกโรงพยาบาล</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-green-600">100%</div>
              <div className="text-sm text-gray-600">ติดตามสต็อกยา</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-orange-600">24/7</div>
              <div className="text-sm text-gray-600">แจ้งเตือนอัตโนมัติ</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-purple-600">📱</div>
              <div className="text-sm text-gray-600">ใช้งานบนมือถือ</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ฟีเจอร์หลักของระบบ
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              ระบบติดตามสต็อกยาที่ใช้งานง่าย ผ่านมือถือ พร้อมการแจ้งเตือนอัตโนมัติ
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">ติดตามสต็อกยา</div>
                    <div className="text-sm text-gray-500">Stock Tracking</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  ติดตามสต็อกยาแยกตาม 2 แผนก พร้อมแจ้งเตือนเมื่อยาใกล้หมด
                </p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    ติดตามยาแบบเรียลไทม์
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    แจ้งเตือนยาใกล้หมด
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    รองรับ 2 แผนก
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">แจ้งเตือนอัตโนมัติ</div>
                    <div className="text-sm text-gray-500">Auto Alerts</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  แจ้งเตือนให้ตรวจเช็คสต็อกที่ไม่ได้อัปเดตนาน และยาที่ใกล้หมด
                </p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    เตือนเช็คสต็อกที่ไม่ได้อัปเดต
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    แจ้งเตือนยาใกล้หมด
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    แสดงผลในระบบ
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ฟีเจอร์เพิ่มเติม
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              ความสามารถเสริมที่ช่วยให้การจัดการสต็อกยามีประสิทธิภาพมากขึ้น
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6 border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all">
              <Download className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-semibold mb-2">ส่งออก Excel</h3>
              <p className="text-sm text-gray-600">ส่งออกข้อมูลทุกประเภทเป็นไฟล์ Excel</p>
            </Card>

            <Card className="text-center p-6 border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all">
              <History className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="font-semibold mb-2">ประวัติรายตัว</h3>
              <p className="text-sm text-gray-600">ติดตามประวัติการเคลื่อนไหวยารายตัว</p>
            </Card>

            <Card className="text-center p-6 border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all">
              <Smartphone className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h3 className="font-semibold mb-2">Mobile-First</h3>
              <p className="text-sm text-gray-600">ออกแบบใช้งานง่ายผ่านโทรศัพท์</p>
            </Card>

            <Card className="text-center p-6 border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all">
              <Eye className="w-12 h-12 mx-auto mb-4 text-orange-600" />
              <h3 className="font-semibold mb-2">ดูข้อมูลครบ</h3>
              <p className="text-sm text-gray-600">เข้าถึงข้อมูลทั้ง 2 แผนกได้</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Department Overview */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            รองรับ 2 แผนกหลัก
          </h2>
          <p className="text-blue-100 mb-12 text-lg">
            ระบบแยกข้อมูลชัดเจนระหว่างแผนก ผู้ใช้สามารถดูข้อมูลทั้ง 2 แผนกได้
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <Building2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">คลังยา</h3>
                <p className="text-blue-100 mb-4">
                  ติดตามสต็อกยาหลัก พร้อมการแจ้งเตือน
                </p>
                <ul className="text-sm text-blue-100 space-y-1">
                  <li>• ติดตามสต็อกยาหลัก</li>
                  <li>• แจ้งเตือนยาใกล้หมด</li>
                  <li>• ตรวจเช็คสต็อกตามกำหนด</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">OPD</h3>
                <p className="text-blue-100 mb-4">
                  ติดตามยาสำหรับผู้ป่วยนอก
                </p>
                <ul className="text-sm text-blue-100 space-y-1">
                  <li>• ติดตามสต็อกยา OPD</li>
                  <li>• ตรวจเช็คยาประจำวัน</li>
                  <li>• จ่ายยาให้ผู้ป่วย</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features Detail */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ความสามารถหลักของระบบ
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              ฟีเจอร์ที่ครอบคลุมการทำงานประจำวันของเภสัชกร
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center p-6 border-0 bg-white shadow-md hover:shadow-lg transition-all">
              <Bell className="w-12 h-12 mx-auto mb-4 text-red-600" />
              <h3 className="font-semibold mb-2">แจ้งเตือนยาใกล้หมด</h3>
              <p className="text-sm text-gray-600">แจ้งเตือนเมื่อยาต่ำกว่าสต็อกที่กำหนด</p>
            </Card>

            <Card className="text-center p-6 border-0 bg-white shadow-md hover:shadow-lg transition-all">
              <Clock className="w-12 h-12 mx-auto mb-4 text-orange-600" />
              <h3 className="font-semibold mb-2">เตือนตรวจเช็คสต็อก</h3>
              <p className="text-sm text-gray-600">แจ้งเตือนสต็อกที่ไม่ได้อัปเดตเป็นเวลานาน</p>
            </Card>

            <Card className="text-center p-6 border-0 bg-white shadow-md hover:shadow-lg transition-all">
              <Download className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-semibold mb-2">ส่งออก Excel</h3>
              <p className="text-sm text-gray-600">ส่งออกข้อมูลทุกประเภทเป็นไฟล์ Excel</p>
            </Card>

            <Card className="text-center p-6 border-0 bg-white shadow-md hover:shadow-lg transition-all">
              <History className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="font-semibold mb-2">ประวัติรายตัว</h3>
              <p className="text-sm text-gray-600">ติดตามประวัติการเคลื่อนไหวยารายตัว</p>
            </Card>

            <Card className="text-center p-6 border-0 bg-white shadow-md hover:shadow-lg transition-all">
              <Smartphone className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h3 className="font-semibold mb-2">ใช้งานง่าย</h3>
              <p className="text-sm text-gray-600">ออกแบบเพื่อใช้งานผ่านโทรศัพท์</p>
            </Card>

            <Card className="text-center p-6 border-0 bg-white shadow-md hover:shadow-lg transition-all">
              <Eye className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
              <h3 className="font-semibold mb-2">ดูข้อมูลครบถ้วน</h3>
              <p className="text-sm text-gray-600">เข้าถึงข้อมูลทั้ง 2 แผนกได้หมด</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Alert System Detail */}
      <section className="py-16 px-4 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ระบบแจ้งเตือนอัตโนมัติ
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              ระบบแจ้งเตือนที่ช่วยให้คุณไม่พลาดการตรวจเช็คสต็อกยา
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-red-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-red-700">แจ้งเตือนยาใกล้หมด</h3>
              </div>
              <p className="text-gray-600 mb-4">
                แจ้งเตือนเมื่อยาในสต็อกต่ำกว่าจำนวนที่กำหนดไว้
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• แจ้งเตือนทันทีเมื่อยาใกล้หมด</li>
                <li>• แยกการแจ้งเตือนตามแผนก</li>
                <li>• แสดงจำนวนที่เหลือและที่ควรสั่ง</li>
              </ul>
            </Card>

            <Card className="p-6 bg-white/80 backdrop-blur-sm border-orange-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-orange-700">เตือนตรวจเช็คสต็อก</h3>
              </div>
              <p className="text-gray-600 mb-4">
                แจ้งเตือนเมื่อสต็อกไม่ได้อัปเดตเป็นเวลานาน
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• ตรวจสอบสต็อกที่ไม่ได้อัปเดต</li>
                <li>• กำหนดช่วงเวลาการเตือน</li>
                <li>• ช่วยให้ข้อมูลสต็อกทันสมัย</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Installation Guide Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              📲 วิธีสร้าง Shortcut บนอุปกรณ์
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              สร้างทางลัดเข้าระบบแบบคลิกเดียว ไม่ต้องจำ URL หรือพิมพ์ใหม่ทุกครั้ง
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Desktop Section */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">💻 Desktop (คอมพิวเตอร์)</div>
                    <div className="text-sm text-gray-500">Windows & MacOS</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Windows */}
                <div className="bg-white/60 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                    <span className="text-lg">🪟</span> Windows
                  </h4>
                  <ol className="text-sm space-y-2 text-gray-700">
                    <li><strong>1.</strong> คลิกขวาบน Desktop → เลือก <strong>New → Shortcut</strong></li>
                    <li><strong>2.</strong> ในช่อง <strong>Location</strong> ใส่:
                      <div className="bg-gray-100 p-2 mt-1 rounded text-xs font-mono break-all">
                        &quot;C:\Program Files\Google\Chrome\Application\chrome.exe&quot; --new-window https://substock-thoen.vercel.app/
                      </div>
                    </li>
                    <li><strong>3.</strong> กด <strong>Next</strong> → ตั้งชื่อ เช่น `Substock`</li>
                    <li><strong>4.</strong> กด <strong>Finish</strong> → ได้ไอคอนบน Desktop</li>
                  </ol>
                </div>

                {/* MacOS */}
                <div className="bg-white/60 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="text-lg">🍎</span> MacOS
                  </h4>
                  <ol className="text-sm space-y-2 text-gray-700">
                    <li><strong>1.</strong> เปิด <strong>Automator</strong> → สร้าง <strong>New Application</strong></li>
                    <li><strong>2.</strong> เพิ่ม Action → <strong>Run Shell Script</strong></li>
                    <li><strong>3.</strong> ใส่คำสั่งนี้:
                      <div className="bg-gray-100 p-2 mt-1 rounded text-xs font-mono break-all">
                        open -a &quot;Google Chrome&quot; https://substock-thoen.vercel.app/
                      </div>
                    </li>
                    <li><strong>4.</strong> Save เป็น `Substock.app` → ลากไปไว้ Desktop/Dock</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Section */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">📱 มือถือ (Mobile)</div>
                    <div className="text-sm text-gray-500">Android & iOS</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Android */}
                <div className="bg-white/60 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                    <span className="text-lg">🤖</span> Android (Chrome)
                  </h4>
                  <ol className="text-sm space-y-2 text-gray-700">
                    <li><strong>1.</strong> เปิด Chrome → เข้า `https://substock-thoen.vercel.app/`</li>
                    <li><strong>2.</strong> กดปุ่มเมนู (⋮) → เลือก <strong>Add to Home screen</strong></li>
                    <li><strong>3.</strong> ได้ไอคอนแอปบน Home screen <strong>เหมือน App จริง!</strong></li>
                  </ol>
                </div>

                {/* iOS */}
                <div className="bg-white/60 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
                    <span className="text-lg">📱</span> iOS (Safari/Chrome)
                  </h4>
                  <ol className="text-sm space-y-2 text-gray-700">
                    <li><strong>1.</strong> เปิด Safari → เข้า `https://substock-thoen.vercel.app/`</li>
                    <li><strong>2.</strong> กด <strong>Share</strong> → เลือก <strong>Add to Home Screen</strong></li>
                    <li><strong>3.</strong> ได้ไอคอนบนหน้าจอ <strong>เหมือนแอป!</strong></li>
                  </ol>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 แนะนำใช้ Safari เพราะ Add to Home screen ได้แน่นอน
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Benefits */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">✨ ประโยชน์ของการสร้าง Shortcut</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="font-semibold">เข้าถึงรวดเร็ว</h4>
                <p className="text-sm text-gray-600">คลิกเดียวเข้าระบบ</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl mb-2">📱</div>
                <h4 className="font-semibold">เหมือน App</h4>
                <p className="text-sm text-gray-600">ประสบการณ์เหมือนแอปจริง</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl mb-2">🔒</div>
                <h4 className="font-semibold">ไม่ต้องจำ URL</h4>
                <p className="text-sm text-gray-600">ไม่ต้องพิมพ์ใหม่ทุกครั้ง</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl mb-2">💾</div>
                <h4 className="font-semibold">ไม่เปลื่อง Storage</h4>
                <p className="text-sm text-gray-600">ไม่ต้องติดตั้งแอป</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            พร้อมที่จะเริ่มใช้งาน?
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            ระบบพร้อมใช้งานทันที ใช้งานง่ายผ่านมือถือ ไม่ต้องติดตั้งซอฟต์แวร์เพิ่มเติม
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-4 w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                <LogIn className="w-5 h-5 mr-2" />
                เข้าสู่ระบบ
              </Button>
            </Link>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>ทดลองใช้งานได้ทันที • ใช้งานง่ายบนมือถือ • รองรับ 2 แผนก</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Pill className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white">Hospital Pharmacy V3.0</span>
              </div>
              <p className="text-sm text-gray-400">
                ระบบติดตามสต็อกยาโรงพยาบาลที่ใช้งานง่าย ผ่านมือถือ
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">ฟีเจอร์หลัก</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• ติดตามสต็อกยาแบบเรียลไทม์</li>
                <li>• แจ้งเตือนยาใกล้หมด</li>
                <li>• เตือนตรวจเช็คสต็อก</li>
                <li>• ส่งออกข้อมูล Excel</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">ความสามารถ</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• ติดตามประวัติการเคลื่อนไหวยา</li>
                <li>• ใช้งานง่ายผ่านโทรศัพท์</li>
                <li>• รองรับข้อมูล 2 แผนก</li>
                <li>• เข้าถึงข้อมูลได้ครบถ้วน</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm text-gray-500 mb-2">
              พัฒนาโดย นสภ.ธนธัช ธำรงโสตถิสกุล มหาวิทยาลัยนเรศวร
            </p>
            <div className="text-xs text-gray-600">
              <p>Hospital Pharmacy Stock Management System V3.0</p>
              <p className="mt-1">© 2025 All rights reserved. Built with ❤️ for healthcare professionals.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Manual Dialog */}
      <Dialog open={showManual} onOpenChange={setShowManual}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-blue-600" />
              คู่มือการใช้งานระบบ Hospital Pharmacy V3.0
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 text-sm">
            {/* ฟีเจอร์หลัก */}
            <div>
              <h3 className="font-semibold text-lg mb-3 text-blue-700">🎯 ฟีเจอร์หลัก</h3>
              <div className="space-y-2 text-gray-600">
                <p><strong>✅ ติดตามสต็อกยา:</strong> ติดตามยาแบบเรียลไทม์แยกตาม 2 แผนก</p>
                <p><strong>🔔 แจ้งเตือนยาใกล้หมด:</strong> แจ้งเตือนเมื่อยาต่ำกว่าสต็อกที่กำหนด</p>
                <p><strong>⏰ เตือนตรวจเช็คสต็อก:</strong> แจ้งเตือนสต็อกที่ไม่ได้อัปเดตเป็นเวลานาน</p>
                <p><strong>📱 ใช้งานบนมือถือ:</strong> ออกแบบใช้งานง่ายผ่านโทรศัพท์</p>
                <p><strong>📊 ส่งออก Excel:</strong> ส่งออกข้อมูลทุกประเภทเป็นไฟล์ Excel</p>
                <p><strong>📋 ประวัติรายตัว:</strong> ติดตามประวัติการเคลื่อนไหวยารายตัว</p>
              </div>
            </div>

            {/* แผนกทั้ง 2 */}
            <div>
              <h3 className="font-semibold text-lg mb-3 text-green-700">🏥 แผนกที่รองรับ</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-700 mb-2">คลังยา</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• ติดตามสต็อกยาหลัก</li>
                    <li>• แจ้งเตือนยาใกล้หมด</li>
                    <li>• ตรวจเช็คสต็อกตามกำหนด</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-700 mb-2">OPD</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• ติดตามสต็อกยา OPD</li>
                    <li>• ตรวจเช็คยาประจำวัน</li>
                    <li>• จ่ายยาให้ผู้ป่วย</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* วิธีการใช้งาน */}
            <div>
              <h3 className="font-semibold text-lg mb-3 text-purple-700">📖 วิธีการใช้งาน</h3>
              <div className="space-y-3 text-gray-600">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p><strong>1. เข้าสู่ระบบ:</strong> กดปุ่ม เข้าสู่ระบบ เพื่อเข้าใช้งาน</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p><strong>2. เลือกแผนก:</strong> เลือกแผนกที่ต้องการใช้งาน (คลังยา หรือ OPD)</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p><strong>3. ติดตามสต็อก:</strong> ดูข้อมูลสต็อกปัจจุบันและรับการแจ้งเตือน</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p><strong>4. ส่งออกข้อมูล:</strong> ส่งออกรายงานเป็นไฟล์ Excel เมื่อต้องการ</p>
                </div>
              </div>
            </div>

            {/* การแจ้งเตือน */}
            <div>
              <h3 className="font-semibold text-lg mb-3 text-red-700">🚨 ระบบแจ้งเตือน</h3>
              <div className="space-y-2 text-gray-600">
                <p><strong>🔴 ยาใกล้หมด:</strong> แจ้งเตือนเมื่อยาในสต็อกต่ำกว่าจำนวนขั้นต่ำ</p>
                <p><strong>🟠 ต้องตรวจเช็ค:</strong> แจ้งเตือนสต็อกที่ไม่ได้อัปเดตเป็นเวลานาน</p>
                <p><strong>🟢 สถานะปกติ:</strong> สต็อกอยู่ในระดับที่เหมาะสม</p>
              </div>
            </div>

            {/* ข้อมูลเทคนิค */}
            <div>
              <h3 className="font-semibold text-lg mb-3 text-gray-700">⚙️ ข้อมูลเทคนิค</h3>
              <div className="space-y-2 text-gray-600">
                <p><strong>🌐 เข้าถึงได้ทุกที่:</strong> ใช้งานผ่านเว็บเบราว์เซอร์บนทุกอุปกรณ์</p>
                <p><strong>👥 รองรับหลายผู้ใช้:</strong> ผู้ใช้สามารถดูข้อมูลทั้ง 2 แผนกได้</p>
                <p><strong>🔒 ปลอดภัย:</strong> ระบบ Authentication และการจัดการสิทธิ์</p>
                <p><strong>📱 Mobile-First:</strong> ออกแบบใช้งานง่ายบนมือถือเป็นหลัก</p>
              </div>
            </div>

            {/* ติดต่อ */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2 text-blue-700">📞 ต้องการความช่วยเหลือ?</h3>
              <p className="text-sm text-gray-600">
                หากมีคำถามหรือต้องการความช่วยเหลือ สามารถติดต่อทีมพัฒนาได้
              </p>
              <p className="text-xs text-gray-500 mt-2">
                พัฒนาโดย นสภ.ธนธัช ธำรงโสตถิสกุล มหาวิทยาลัยนเรศวร
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}