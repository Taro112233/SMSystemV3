// app/page.tsx
// InvenStock Multi-Tenant Inventory Management System V2.0 - Enhanced Landing Page

'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Building2, 
  Users, 
  Shield,  
  Activity,
  CheckCircle,
  LogIn,
  BookIcon,
  ArrowRight,
  Zap,
  Globe,
  BarChart3,
  RefreshCw,
  Database,
  Network,
  Workflow,
  Crown,
  UserCheck,
  Layers,
  Target,
  TrendingUp,
  FileText,
  MessageSquare,
  Star,
  CheckCircle2
} from 'lucide-react';

export default function LandingPage() {
  const [showManual, setShowManual] = useState(false);

  const handleManualClick = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      sessionStorage.clear()
      
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
      });
      
      console.log('All cookies and storage cleared for manual access')
      
    } catch (error) {
      console.error('Error clearing cookies:', error)
      
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      sessionStorage.clear()
      
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
      });
    }
    
    setShowManual(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">InvenStock</h1>
                <p className="text-sm text-gray-600">Multi-Tenant Inventory System V2.0</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleManualClick}>
                <BookIcon className="w-4 h-4 mr-2" />
                คู่มือ
              </Button>
              <Link href="/dashboard">
                <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                  <LogIn className="w-4 h-4" />
                  เข้าสู่ระบบ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Crown className="w-4 h-4" />
            Enterprise-Grade Multi-Tenant Architecture
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            ระบบจัดการสต็อก
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 block">
              แบบองค์กร
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Multi-Tenant Inventory Management พร้อม Department-Centric Stock Management, 
            Custom Role System และ Real-time Analytics สำหรับองค์กรขนาดใหญ่
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-4 w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 h-14">
                <Zap className="w-5 h-5 mr-2" />
                เริ่มใช้งานระบบ
              </Button>
            </Link>
            
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 w-full sm:w-auto border-blue-200 hover:bg-blue-50 h-14" onClick={handleManualClick}>
              <FileText className="w-5 h-5 mr-2" />
              ดูเอกสารระบบ
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-blue-600 mb-2">Multi-Tenant</div>
              <div className="text-sm text-gray-600">หลายองค์กรในระบบเดียว</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-green-600 mb-2">Real-time</div>
              <div className="text-sm text-gray-600">อัปเดตสต็อกแบบเรียลไทม์</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-purple-600 mb-2">Department</div>
              <div className="text-sm text-gray-600">จัดการแยกตามหน่วยงาน</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-orange-600 mb-2">Enterprise</div>
              <div className="text-sm text-gray-600">ระดับองค์กรขนาดใหญ่</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architecture Features */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              สถาปัตยกรรมระดับองค์กร
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              ออกแบบมาเพื่อรองรับองค์กรขนาดใหญ่ด้วย Multi-Tenant Architecture และ Department-Centric Management
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Network className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">Multi-Tenant Architecture</div>
                    <div className="text-sm text-gray-500">องค์กรหลายองค์กร</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  แยกข้อมูลองค์กรอย่างสมบูรณ์ ผู้ใช้สามารถเป็นสมาชิกหลายองค์กรได้
                </p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Data Isolation ระดับองค์กร
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Multi-Organization Context
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Organization Switching
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Layers className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">Department-Centric</div>
                    <div className="text-sm text-gray-500">จัดการแยกตามหน่วยงาน</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  จัดการสต็อกแยกตามหน่วยงาน พร้อมโครงสร้างหน่วยงานแบบ Hierarchical
                </p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Hierarchical Departments
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Department Stock Tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Inter-Department Transfers
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">Custom Role System</div>
                    <div className="text-sm text-gray-500">สิทธิ์แบบ Granular</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  ระบบสิทธิ์แบบ 3-Tier: Member → Admin → Owner พร้อม Department Permissions
                </p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Granular Permissions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Department-Level Access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Role Hierarchy System
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Business Flow Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Business Flow & Navigation
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              ออกแบบ User Experience ให้เหมาะสมกับการทำงานแบบองค์กร
            </p>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 mb-12">
            <h3 className="text-2xl font-bold text-center mb-8">User Journey</h3>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col items-center text-center flex-1">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                  <LogIn className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold mb-2">1. Login</h4>
                <p className="text-sm text-gray-600">เข้าสู่ระบบด้วย Username</p>
              </div>
              
              <ArrowRight className="w-6 h-6 text-gray-400 hidden md:block" />
              
              <div className="flex flex-col items-center text-center flex-1">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-4">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold mb-2">2. Select Organization</h4>
                <p className="text-sm text-gray-600">เลือกองค์กรที่ต้องการ</p>
              </div>
              
              <ArrowRight className="w-6 h-6 text-gray-400 hidden md:block" />
              
              <div className="flex flex-col items-center text-center flex-1">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                  <Layers className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold mb-2">3. Department Context</h4>
                <p className="text-sm text-gray-600">เข้าสู่งานในหน่วยงาน</p>
              </div>
              
              <ArrowRight className="w-6 h-6 text-gray-400 hidden md:block" />
              
              <div className="flex flex-col items-center text-center flex-1">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-4">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold mb-2">4. Work & Collaborate</h4>
                <p className="text-sm text-gray-600">จัดการสต็อกและการเบิกจ่าย</p>
              </div>
            </div>
          </div>

          {/* Navigation Structure */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  Organization Level
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">/org/{'{slug}'} - Organization Dashboard</p>
                    <p className="text-sm text-gray-600">ภาพรวมองค์กร และสถิติหลัก</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                  <Database className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium">/org/{'{slug}'}/products - Product Catalog</p>
                    <p className="text-sm text-gray-600">จัดการสินค้าทั้งองค์กร</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                  <Workflow className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">/org/{'{slug}'}/transfers - Organization Transfers</p>
                    <p className="text-sm text-gray-600">การเบิกจ่ายระหว่างหน่วยงาน</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-green-600" />
                  Department Level
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                  <Activity className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">/departments/{'{id}'}/stocks - Department Stocks</p>
                    <p className="text-sm text-gray-600">สต็อกเฉพาะหน่วยงาน</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                  <RefreshCw className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">/departments/{'{id}'}/transfers - Dept Transfers</p>
                    <p className="text-sm text-gray-600">การเบิกจ่ายของหน่วยงาน</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium">/departments/{'{id}'}/reports - Dept Analytics</p>
                    <p className="text-sm text-gray-600">รายงานประสิทธิภาพหน่วยงาน</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technical Excellence */}
      <section className="py-16 px-4 bg-gradient-to-r from-gray-50 to-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Technical Excellence
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              เทคโนโลยีและสถาปัตยกรรมระดับ Enterprise สำหรับระบบที่มีประสิทธิภาพสูง
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6 bg-white hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold mb-2">PostgreSQL + Prisma</h3>
              <p className="text-sm text-gray-600">Row-level Security และ Type-safe Database Access</p>
            </Card>

            <Card className="text-center p-6 bg-white hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold mb-2">Arcjet Security</h3>
              <p className="text-sm text-gray-600">Bot Detection, Rate Limiting และ Security Shield</p>
            </Card>

            <Card className="text-center p-6 bg-white hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold mb-2">Next.js 15 + React 19</h3>
              <p className="text-sm text-gray-600">Server Components และ Streaming Architecture</p>
            </Card>

            <Card className="text-center p-6 bg-white hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-bold mb-2">Real-time Updates</h3>
              <p className="text-sm text-gray-600">Live Stock Updates และ Notification System</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              InvenStock V2.0 vs Traditional Systems
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              เปรียบเทียบความสามารถที่โดดเด่นของระบบ
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500" />
                  InvenStock V2.0
                </h3>
                <div className="space-y-4">
                  {[
                    "Multi-Tenant Architecture แยกข้อมูลองค์กร",
                    "Department-Centric Stock Management",
                    "Real-time Stock Updates ทุกหน่วยงาน",
                    "Custom Role System แบบ Granular",
                    "Organization Context Switching",
                    "Inter-Department Transfer Workflow",
                    "Enterprise Security (Arcjet)",
                    "Mobile-First Responsive Design",
                    "Advanced Analytics per Department",
                    "Audit Trail และ Activity Logs"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-500 mb-6">
                  Traditional Inventory Systems
                </h3>
                <div className="space-y-4">
                  {[
                    "Single Organization เท่านั้น",
                    "Global Stock Management",
                    "Manual Stock Updates",
                    "Fixed User Roles",
                    "No Organization Context",
                    "Basic Transfer Features",
                    "Limited Security Features",
                    "Desktop-First Design",
                    "Basic Reporting",
                    "Limited Activity Tracking"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0" />
                      <span className="text-gray-500 line-through">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            พร้อมขยายธุรกิจด้วยระบบระดับ Enterprise?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            เริ่มต้นการจัดการสต็อกแบบมืออาชีพด้วย InvenStock V2.0 
            ระบบที่ออกแบบมาสำหรับองค์กรที่เติบโตอย่างรวดเร็ว
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-4 w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100 h-14">
                <Crown className="w-5 h-5 mr-2" />
                เข้าใช้งานระบบ
              </Button>
            </Link>
            
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 w-full sm:w-auto border-white text-white hover:bg-white/10 h-14" onClick={handleManualClick}>
              <FileText className="w-5 h-5 mr-2" />
              ดูเอกสารเทคนิค
            </Button>
          </div>

          <div className="text-blue-100">
            <p>✨ ระบบพร้อมใช้งานทันที • 🔒 รักษาความปลอดภัยระดับ Enterprise • 📱 รองรับทุกอุปกรณ์</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="font-bold text-white text-xl">InvenStock V2.0</span>
                  <p className="text-sm text-gray-400">Multi-Tenant Inventory Management</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                ระบบจัดการสต็อกสินค้าระดับองค์กรที่ออกแบบมาเพื่อรองรับการเติบโตและความซับซ้อนของธุรกิจสมัยใหม่
              </p>
              <div className="flex gap-4">
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  สนทนากับทีม
                </Button>
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  <FileText className="w-4 h-4 mr-2" />
                  API Docs
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Core Features</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Multi-Tenant Architecture
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Department Stock Management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Real-time Updates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Custom Role System
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Enterprise Security
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Tech Stack</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  Next.js 15 + React 19
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  PostgreSQL + Prisma ORM
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  TailwindCSS + Shadcn/UI
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  JWT + bcryptjs
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  Arcjet Security
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-sm text-gray-500 mb-4 md:mb-0">
                <p>พัฒนาโดย นสภ.ธนธัช ธำรงโสตถิสกุล มหาวิทยาลัยนเรศวร</p>
                <p className="mt-1">© 2025 InvenStock V2.0 - Enterprise Inventory Management System</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Built with ❤️ for Enterprise</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>System Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Enhanced Manual Dialog */}
      <Dialog open={showManual} onOpenChange={setShowManual}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <Building2 className="w-6 h-6 text-blue-600" />
              InvenStock V2.0 - Technical Documentation
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-8 text-sm">
            {/* Architecture Overview */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-blue-700 flex items-center gap-2">
                🏗️ System Architecture
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-3">
                  <strong>Multi-Tenant Architecture:</strong> ระบบที่ออกแบบให้รองรับหลายองค์กรในระบบเดียว 
                  โดยแยกข้อมูลอย่างสมบูรณ์ด้วย Row-level Security
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">Frontend Architecture</h4>
                    <ul className="text-xs space-y-1 text-gray-600">
                      <li>• Next.js 15 with App Router</li>
                      <li>• React 19 Server Components</li>
                      <li>• TypeScript for Type Safety</li>
                      <li>• TailwindCSS + Shadcn/UI</li>
                      <li>• Responsive Mobile-First Design</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">Backend Architecture</h4>
                    <ul className="text-xs space-y-1 text-gray-600">
                      <li>• PostgreSQL with Row-level Security</li>
                      <li>• Prisma ORM with Multi-Schema</li>
                      <li>• JWT Authentication</li>
                      <li>• Arcjet Security Layer</li>
                      <li>• RESTful API Design</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Flow */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-green-700 flex items-center gap-2">
                🗺️ Navigation & User Flow
              </h3>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Organization-Level Routes</h4>
                  <div className="space-y-2 text-xs">
                    <p><code>/dashboard</code> - Organization Selector (เลือกองค์กร)</p>
                    <p><code>/org/[orgSlug]</code> - Organization Dashboard</p>
                    <p><code>/org/[orgSlug]/products</code> - Product Management</p>
                    <p><code>/org/[orgSlug]/transfers</code> - Organization-wide Transfers</p>
                    <p><code>/org/[orgSlug]/reports</code> - Analytics & Reports</p>
                    <p><code>/org/[orgSlug]/settings</code> - Organization Settings</p>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Department-Level Routes</h4>
                  <div className="space-y-2 text-xs">
                    <p><code>/org/[orgSlug]/departments/[deptId]</code> - Department Dashboard</p>
                    <p><code>/org/[orgSlug]/departments/[deptId]/stocks</code> - Department Stock Management</p>
                    <p><code>/org/[orgSlug]/departments/[deptId]/transfers</code> - Department Transfers</p>
                    <p><code>/org/[orgSlug]/departments/[deptId]/reports</code> - Department Analytics</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Role System */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-purple-700 flex items-center gap-2">
                👥 Role & Permission System
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-1">
                    <Users className="w-4 h-4" /> MEMBER
                  </h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• ดูสต็อกสินค้า</li>
                    <li>• ปรับสต็อกในหน่วยงานที่มีสิทธิ์</li>
                    <li>• สร้างใบเบิกสินค้า</li>
                    <li>• รับสินค้าที่เบิก</li>
                    <li>• ดูรายงานพื้นฐาน</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-1">
                    <Shield className="w-4 h-4" /> ADMIN
                  </h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• ทุกสิทธิ์ของ Member</li>
                    <li>• จัดการสินค้า (CRUD)</li>
                    <li>• สร้างหมวดหมู่สินค้า</li>
                    <li>• เชิญผู้ใช้เข้าองค์กร</li>
                    <li>• อนุมัติการเบิกจ่าย</li>
                    <li>• ดูรายงานขั้นสูง</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-1">
                    <Crown className="w-4 h-4" /> OWNER
                  </h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• ทุกสิทธิ์ของ Admin</li>
                    <li>• จัดการหน่วยงาน (CRUD)</li>
                    <li>• ตั้งค่าองค์กร</li>
                    <li>• จัดการสมาชิกองค์กร</li>
                    <li>• ดูรายงานระดับองค์กร</li>
                    <li>• กำหนดสิทธิ์ผู้ใช้</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Department Transfer Workflow */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-orange-700 flex items-center gap-2">
                🔄 Transfer Workflow
              </h3>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-3">
                  <strong>Department-to-Department Transfer Process:</strong> กระบวนการเบิกจ่ายสินค้าระหว่างหน่วยงานแบบมีการควบคุม
                </p>
                <div className="grid md:grid-cols-5 gap-3 text-xs">
                  <div className="text-center p-3 bg-white rounded">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <h4 className="font-semibold">REQUEST</h4>
                    <p className="text-gray-600">หน่วยงานสร้างใบเบิก</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <h4 className="font-semibold">APPROVE</h4>
                    <p className="text-gray-600">ผู้มีสิทธิ์อนุมัติ</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <h4 className="font-semibold">PREPARE</h4>
                    <p className="text-gray-600">หน่วยงานต้นทางเตรียม</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">4</span>
                    </div>
                    <h4 className="font-semibold">DELIVER</h4>
                    <p className="text-gray-600">ส่งมอบสินค้า</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">5</span>
                    </div>
                    <h4 className="font-semibold">RECEIVE</h4>
                    <p className="text-gray-600">หน่วยงานปลายทางรับ</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Features */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-red-700 flex items-center gap-2">
                🔒 Security Features
              </h3>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-red-800 mb-2">Authentication & Authorization</h4>
                    <ul className="text-xs space-y-1 text-gray-600">
                      <li>• JWT Token-based Authentication</li>
                      <li>• bcrypt Password Hashing</li>
                      <li>• Role-based Access Control (RBAC)</li>
                      <li>• Organization-level Data Isolation</li>
                      <li>• Department-level Permissions</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-800 mb-2">Arcjet Security Layer</h4>
                    <ul className="text-xs space-y-1 text-gray-600">
                      <li>• Bot Detection & Blocking</li>
                      <li>• Rate Limiting (API & Login)</li>
                      <li>• Shield Protection (SQL Injection, XSS)</li>
                      <li>• Hosting IP Detection</li>
                      <li>• Real-time Security Monitoring</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Getting Started */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-4 text-indigo-700 flex items-center gap-2">
                🚀 Getting Started
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-semibold">สมัครสมาชิกและสร้างองค์กร</p>
                    <p className="text-gray-600 text-xs">ใช้ Username เป็น Primary Credential พร้อมสร้างองค์กรแรก</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-semibold">ตั้งค่าหน่วยงานและสินค้า</p>
                    <p className="text-gray-600 text-xs">สร้างโครงสร้างหน่วยงานและเพิ่มสินค้าพร้อมสต็อกเริ่มต้น</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-semibold">เชิญทีมงานและกำหนดสิทธิ์</p>
                    <p className="text-gray-600 text-xs">เพิ่มสมาชิกในองค์กรและกำหนดสิทธิ์ตามหน่วยงานและบทบาท</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">4</span>
                  </div>
                  <div>
                    <p className="font-semibold">เริ่มใช้งานระบบ</p>
                    <p className="text-gray-600 text-xs">จัดการสต็อก สร้างใบเบิก และติดตามการเคลื่อนไหวสินค้า</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <h3 className="font-semibold text-lg mb-2 text-gray-800">ต้องการความช่วยเหลือเพิ่มเติม?</h3>
              <p className="text-sm text-gray-600 mb-3">
                ติดต่อทีมพัฒนาสำหรับการสนับสนุนด้านเทคนิคและการปรับแต่งระบบ
              </p>
              <div className="flex justify-center gap-3">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  สนทนากับทีม
                </Button>
                <Button size="sm" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  API Documentation
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                พัฒนาโดย นสภ.ธนธัช ธำรงโสตถิสกุล มหาวิทยาลัยนเรศวร
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}