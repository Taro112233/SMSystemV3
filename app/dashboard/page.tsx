// app/dashboard/page.tsx
"use client";

import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Package, 
  ArrowLeft,
  Settings,
  Bell,
  Search,
  Plus,
  MoreHorizontal,
  Calendar,
  FileText,
  TrendingUp,
  AlertTriangle,
  Star,
  Grid3X3,
  LayoutGrid,
  List,
  Filter,
  ChevronDown,
  Pin,
  Archive,
  Home,
  Warehouse,
  Hospital,
  ShoppingCart,
  Stethoscope,
  TestTube,
  Pill,
  Activity,
  BarChart3,
  ClipboardList,
  UserPlus,
  Zap,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Dot,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

// Mock data
const organization = {
  id: 'org-001',
  name: 'โรงพยาบาลศิริราช',
  slug: 'siriraj-hospital',
  description: 'ระบบจัดการสต็อกยาโรงพยาบาลศิริราช',
  logo: 'ศร',
  color: 'bg-blue-500',
  userRole: 'OWNER',
  stats: {
    totalProducts: 1247,
    lowStockItems: 23,
    pendingTransfers: 15,
    activeUsers: 89,
    totalValue: '12.5M',
    departments: 12
  }
};

const departments = [
  {
    id: 'dept-001',
    name: 'คลังยาหลัก',
    code: 'MAIN',
    icon: Warehouse,
    color: 'bg-blue-500',
    description: 'คลังยาหลักของโรงพยาบาล',
    memberCount: 15,
    isActive: true,
    notifications: 5,
    stockItems: 856,
    lowStock: 12,
    lastActivity: '5 นาทีที่แล้ว',
    manager: 'นายสมชาย ใจดี',
    category: 'main'
  },
  {
    id: 'dept-002',
    name: 'ห้องฉุกเฉิน (ER)',
    code: 'ER',
    icon: Activity,
    color: 'bg-red-500',
    description: 'แผนกฉุกเฉินและการแพทย์ฉุกเฉิน',
    memberCount: 25,
    isActive: true,
    notifications: 2,
    stockItems: 245,
    lowStock: 5,
    lastActivity: '2 นาทีที่แล้ว',
    manager: 'นางสาวมาลี รักษา',
    category: 'clinical'
  },
  {
    id: 'dept-003',
    name: 'หอผู้ป่วยใน (IPD)',
    code: 'IPD',
    icon: Hospital,
    color: 'bg-green-500',
    description: 'หอผู้ป่วยในทั่วไป',
    memberCount: 45,
    isActive: true,
    notifications: 0,
    stockItems: 312,
    lowStock: 3,
    lastActivity: '15 นาทีที่แล้ว',
    manager: 'นายประยุทธ ดูแล',
    category: 'clinical'
  },
  {
    id: 'dept-004',
    name: 'ผู้ป่วยนอก (OPD)',
    code: 'OPD',
    icon: Users,
    color: 'bg-purple-500',
    description: 'แผนกผู้ป่วยนอก',
    memberCount: 20,
    isActive: true,
    notifications: 1,
    stockItems: 189,
    lowStock: 2,
    lastActivity: '30 นาทีที่แล้ว',
    manager: 'นางสาวสุดา อบอุ่น',
    category: 'clinical'
  },
  {
    id: 'dept-005',
    name: 'ห้องผ่าตัด (OR)',
    code: 'OR',
    icon: ShoppingCart,
    color: 'bg-orange-500',
    description: 'ห้องผ่าตัดและอุปกรณ์การแพทย์',
    memberCount: 30,
    isActive: true,
    notifications: 3,
    stockItems: 156,
    lowStock: 1,
    lastActivity: '1 ชั่วโมงที่แล้ว',
    manager: 'นายสุรชัย ผ่า',
    category: 'clinical'
  },
  {
    id: 'dept-006',
    name: 'ห้องปฏิบัติการ (LAB)',
    code: 'LAB',
    icon: TestTube,
    color: 'bg-teal-500',
    description: 'ห้องปฏิบัติการตรวจวิเคราะห์',
    memberCount: 12,
    isActive: true,
    notifications: 0,
    stockItems: 89,
    lowStock: 0,
    lastActivity: '2 ชั่วโมงที่แล้ว',
    manager: 'นางสาววิทยา วิเคราะห์',
    category: 'support'
  },
  {
    id: 'dept-007',
    name: 'ร้านยา (PHARMACY)',
    code: 'PHARM',
    icon: Pill,
    color: 'bg-pink-500',
    description: 'ร้านยาสำหรับผู้ป่วย',
    memberCount: 8,
    isActive: true,
    notifications: 1,
    stockItems: 567,
    lowStock: 8,
    lastActivity: '10 นาทีที่แล้ว',
    manager: 'นางสาวเภสัช จ่ายยา',
    category: 'support'
  },
  {
    id: 'dept-008',
    name: 'ICU',
    code: 'ICU',
    icon: Stethoscope,
    color: 'bg-indigo-500',
    description: 'หอผู้ป่วยวิกฤต',
    memberCount: 18,
    isActive: true,
    notifications: 4,
    stockItems: 134,
    lowStock: 3,
    lastActivity: '8 นาทีที่แล้ว',
    manager: 'นายวิกฤต ช่วยชีวิต',
    category: 'clinical'
  }
];

const recentActivities = [
  {
    id: 1,
    type: 'transfer',
    icon: ArrowLeft,
    title: 'การโอนยาระหว่างแผนก',
    description: 'ER → ICU: Epinephrine 10 หลอด',
    time: '5 นาทีที่แล้ว',
    status: 'pending',
    user: 'นายสมชาย ใจดี'
  },
  {
    id: 2,
    type: 'stock',
    icon: AlertTriangle,
    title: 'แจ้งเตือนสต็อกต่ำ',
    description: 'Morphine ในแผนก OR เหลือ 5 หลอด',
    time: '12 นาทีที่แล้ว',
    status: 'warning',
    user: 'ระบบอัตโนมัติ'
  },
  {
    id: 3,
    type: 'adjustment',
    icon: Edit,
    title: 'ปรับสต็อกสินค้า',
    description: 'ปรับยอดยา Paracetamol ในคลังหลัก +200 เม็ด',
    time: '25 นาทีที่แล้ว',
    status: 'completed',
    user: 'นางสาวมาลี รักษา'
  },
  {
    id: 4,
    type: 'user',
    icon: UserPlus,
    title: 'เพิ่มสมาชิกใหม่',
    description: 'เพิ่มพยาบาลใหม่เข้าแผนก IPD',
    time: '1 ชั่วโมงที่แล้ว',
    status: 'completed',
    user: 'นายประยุทธ ดูแล'
  }
];

const OrganizationDashboard = () => {
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedDepartments = {
    main: filteredDepartments.filter(d => d.category === 'main'),
    clinical: filteredDepartments.filter(d => d.category === 'clinical'),
    support: filteredDepartments.filter(d => d.category === 'support')
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-white border-r border-gray-200 transition-all duration-200 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${organization.color} rounded-lg flex items-center justify-center text-white font-bold`}>
                  {organization.logo}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-gray-900 text-sm leading-tight truncate">
                    {organization.name}
                  </h2>
                  <p className="text-xs text-gray-500 truncate">{organization.userRole}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSidebarCollapsed(true)}
                className="h-8 w-8"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSidebarCollapsed(false)}
                className="h-8 w-8"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar Content */}
        <ScrollArea className="flex-1">
          <div className="p-3">
            {!sidebarCollapsed && (
              <>
                {/* Back to Organizations */}
                <Button 
                  variant="ghost" 
                  className="w-full justify-start mb-4 text-sm h-9"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  กลับไปเลือกองค์กร
                </Button>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input 
                    placeholder="ค้นหาแผนก..." 
                    className="pl-10 h-8 text-sm bg-gray-50 border-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Main Navigation */}
            <div className="space-y-1 mb-6">
              {!sidebarCollapsed && (
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  หน้าหลัก
                </div>
              )}
              
              <Button 
                variant="secondary" 
                className={`${sidebarCollapsed ? 'w-full justify-center' : 'w-full justify-start'} h-9`}
              >
                <Home className="w-4 h-4" />
                {!sidebarCollapsed && <span className="ml-2">ภาพรวมองค์กร</span>}
              </Button>
              
              <Button 
                variant="ghost" 
                className={`${sidebarCollapsed ? 'w-full justify-center' : 'w-full justify-start'} h-9`}
              >
                <BarChart3 className="w-4 h-4" />
                {!sidebarCollapsed && <span className="ml-2">รายงาน</span>}
              </Button>
              
              <Button 
                variant="ghost" 
                className={`${sidebarCollapsed ? 'w-full justify-center' : 'w-full justify-start'} h-9`}
              >
                <Settings className="w-4 h-4" />
                {!sidebarCollapsed && <span className="ml-2">ตั้งค่า</span>}
              </Button>
            </div>

            {/* Departments */}
            <div className="space-y-4">
              {!sidebarCollapsed && (
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  แผนกทั้งหมด
                </div>
              )}

              {/* Main Department */}
              {groupedDepartments.main.map((dept) => {
                const IconComponent = dept.icon;
                const isSelected = selectedDepartment?.id === dept.id;
                
                return (
                  <Button
                    key={dept.id}
                    variant={isSelected ? "secondary" : "ghost"}
                    className={`${sidebarCollapsed ? 'w-full justify-center' : 'w-full justify-start'} h-9 relative`}
                    onClick={() => setSelectedDepartment(dept)}
                  >
                    <div className={`w-6 h-6 ${dept.color} rounded flex items-center justify-center ${sidebarCollapsed ? 'mr-0' : 'mr-2'}`}>
                      <IconComponent className="w-3 h-3 text-white" />
                    </div>
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left truncate">{dept.name}</span>
                        {dept.notifications > 0 && (
                          <Badge variant="destructive" className="h-5 min-w-5 text-xs p-1">
                            {dept.notifications}
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>
                );
              })}

              {!sidebarCollapsed && groupedDepartments.clinical.length > 0 && (
                <>
                  <Separator className="my-2" />
                  <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    แผนกคลินิก
                  </div>
                </>
              )}

              {/* Clinical Departments */}
              {groupedDepartments.clinical.map((dept) => {
                const IconComponent = dept.icon;
                const isSelected = selectedDepartment?.id === dept.id;
                
                return (
                  <Button
                    key={dept.id}
                    variant={isSelected ? "secondary" : "ghost"}
                    className={`${sidebarCollapsed ? 'w-full justify-center' : 'w-full justify-start'} h-9 relative`}
                    onClick={() => setSelectedDepartment(dept)}
                  >
                    <div className={`w-6 h-6 ${dept.color} rounded flex items-center justify-center ${sidebarCollapsed ? 'mr-0' : 'mr-2'}`}>
                      <IconComponent className="w-3 h-3 text-white" />
                    </div>
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left truncate">{dept.name}</span>
                        {dept.notifications > 0 && (
                          <Badge variant="destructive" className="h-5 min-w-5 text-xs p-1">
                            {dept.notifications}
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>
                );
              })}

              {!sidebarCollapsed && groupedDepartments.support.length > 0 && (
                <>
                  <Separator className="my-2" />
                  <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    แผนกสนับสนุน
                  </div>
                </>
              )}

              {/* Support Departments */}
              {groupedDepartments.support.map((dept) => {
                const IconComponent = dept.icon;
                const isSelected = selectedDepartment?.id === dept.id;
                
                return (
                  <Button
                    key={dept.id}
                    variant={isSelected ? "secondary" : "ghost"}
                    className={`${sidebarCollapsed ? 'w-full justify-center' : 'w-full justify-start'} h-9 relative`}
                    onClick={() => setSelectedDepartment(dept)}
                  >
                    <div className={`w-6 h-6 ${dept.color} rounded flex items-center justify-center ${sidebarCollapsed ? 'mr-0' : 'mr-2'}`}>
                      <IconComponent className="w-3 h-3 text-white" />
                    </div>
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left truncate">{dept.name}</span>
                        {dept.notifications > 0 && (
                          <Badge variant="destructive" className="h-5 min-w-5 text-xs p-1">
                            {dept.notifications}
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        </ScrollArea>

        {/* Sidebar Footer */}
        {!sidebarCollapsed && (
          <div className="p-3 border-t border-gray-200">
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">AI</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">Ai Satang</div>
                <div className="text-xs text-gray-500">เจ้าขององค์กร</div>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <LogOut className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {selectedDepartment ? (
                <>
                  <div className={`w-8 h-8 ${selectedDepartment.color} rounded flex items-center justify-center`}>
                    {React.createElement(selectedDepartment.icon, { className: "w-4 h-4 text-white" })}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      {selectedDepartment.name}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {selectedDepartment.description}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className={`w-8 h-8 ${organization.color} rounded flex items-center justify-center`}>
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      ภาพรวมองค์กร
                    </h1>
                    <p className="text-sm text-gray-600">
                      {organization.name}
                    </p>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                วันนี้
              </Button>
              <Button variant="outline" size="icon">
                <Bell className="w-4 h-4" />
              </Button>
              <Avatar>
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-auto">
          {selectedDepartment ? (
            // Department View
            <div className="space-y-6">
              {/* Department Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">สินค้าทั้งหมด</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedDepartment.stockItems}</p>
                      </div>
                      <Package className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">ใกล้หมด</p>
                        <p className="text-2xl font-bold text-orange-600">{selectedDepartment.lowStock}</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">สมาชิก</p>
                        <p className="text-2xl font-bold text-green-600">{selectedDepartment.memberCount}</p>
                      </div>
                      <Users className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">แจ้งเตือน</p>
                        <p className="text-2xl font-bold text-red-600">{selectedDepartment.notifications}</p>
                      </div>
                      <Bell className="w-8 h-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Department Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="w-5 h-5" />
                      การจัดการสต็อก
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button className="w-full justify-start" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        ดูสต็อกสินค้า
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        ปรับสต็อก
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        นับสต็อก
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        เพิ่มสินค้า
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      การเบิกจ่าย
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button className="w-full justify-start" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        สร้างใบเบิก
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <FileText className="w-4 h-4 mr-2" />
                        ดูรายการเบิก
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        อนุมัติการเบิก
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        รับสินค้า
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Department Info */}
              <Card>
                <CardHeader>
                  <CardTitle>ข้อมูลแผนก</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">รายละเอียด</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">รหัสแผนก:</span>
                          <span className="font-mono">{selectedDepartment.code}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">ผู้จัดการ:</span>
                          <span>{selectedDepartment.manager}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">กิจกรรมล่าสุด:</span>
                          <span>{selectedDepartment.lastActivity}</span>
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
            </div>
          ) : (
            // Organization Overview
            <div className="space-y-6">
              {/* Organization Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">สินค้าทั้งหมด</p>
                        <p className="text-2xl font-bold text-gray-900">{organization.stats.totalProducts.toLocaleString()}</p>
                      </div>
                      <Package className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">ใกล้หมด</p>
                        <p className="text-2xl font-bold text-orange-600">{organization.stats.lowStockItems}</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">รอดำเนินการ</p>
                        <p className="text-2xl font-bold text-blue-600">{organization.stats.pendingTransfers}</p>
                      </div>
                      <FileText className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">ผู้ใช้งาน</p>
                        <p className="text-2xl font-bold text-green-600">{organization.stats.activeUsers}</p>
                      </div>
                      <Users className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-500" />
                      การจัดการด่วน
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button className="w-full justify-start" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        สร้างใบเบิกด่วน
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        ตรวจสอบสต็อกต่ำ
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Clock className="w-4 h-4 mr-2" />
                        รายการรออนุมัติ
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-green-500" />
                      รายงานและสถิติ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button className="w-full justify-start" variant="outline">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        รายงานสต็อก
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Activity className="w-4 h-4 mr-2" />
                        กิจกรรมแผนก
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <FileText className="w-4 h-4 mr-2" />
                        รายงานการเบิกจ่าย
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-purple-500" />
                      การจัดการองค์กร
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button className="w-full justify-start" variant="outline">
                        <UserPlus className="w-4 h-4 mr-2" />
                        จัดการสมาชิก
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Building2 className="w-4 h-4 mr-2" />
                        จัดการแผนก
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Shield className="w-4 h-4 mr-2" />
                        ตั้งค่าสิทธิ์
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Department Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      แผนกทั้งหมด
                      <Badge variant="secondary">{departments.length} แผนก</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {departments.map((dept) => {
                        const IconComponent = dept.icon;
                        return (
                          <div 
                            key={dept.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                            onClick={() => setSelectedDepartment(dept)}
                          >
                            <div className={`w-10 h-10 ${dept.color} rounded-lg flex items-center justify-center`}>
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-gray-900 truncate">{dept.name}</h3>
                                {dept.notifications > 0 && (
                                  <Badge variant="destructive" className="h-5 min-w-5 text-xs px-1">
                                    {dept.notifications}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                <span>{dept.stockItems} สินค้า</span>
                                <span>{dept.memberCount} คน</span>
                                <span className={dept.lowStock > 0 ? 'text-orange-600' : 'text-green-600'}>
                                  {dept.lowStock > 0 ? `${dept.lowStock} ใกล้หมด` : 'สต็อกปกติ'}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>กิจกรรมล่าสุด</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                      {recentActivities.map((activity) => {
                        const IconComponent = activity.icon;
                        let statusColor = 'bg-gray-100 text-gray-600';
                        
                        if (activity.status === 'pending') statusColor = 'bg-yellow-100 text-yellow-600';
                        if (activity.status === 'warning') statusColor = 'bg-orange-100 text-orange-600';
                        if (activity.status === 'completed') statusColor = 'bg-green-100 text-green-600';
                        
                        return (
                          <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className={`w-8 h-8 ${statusColor} rounded-full flex items-center justify-center`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-sm">{activity.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{activity.time}</span>
                                <Dot className="w-3 h-3" />
                                <span>{activity.user}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Organization Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>ประสิทธิภาพองค์กร</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">อัตราการใช้สต็อก</span>
                        <span className="text-sm font-bold text-green-600">87%</span>
                      </div>
                      <Progress value={87} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">ความถูกต้องสต็อก</span>
                        <span className="text-sm font-bold text-blue-600">95%</span>
                      </div>
                      <Progress value={95} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">ประสิทธิภาพการเบิกจ่าย</span>
                        <span className="text-sm font-bold text-purple-600">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{organization.stats.totalValue}</div>
                      <div className="text-sm text-gray-600">มูลค่าสต็อกรวม</div>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">156</div>
                      <div className="text-sm text-gray-600">การเบิกจ่ายวันนี้</div>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">98.2%</div>
                      <div className="text-sm text-gray-600">ความพึงพอใจ</div>
                    </div>
                    
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">2.3</div>
                      <div className="text-sm text-gray-600">วันเฉลี่ยการเบิก</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default OrganizationDashboard;