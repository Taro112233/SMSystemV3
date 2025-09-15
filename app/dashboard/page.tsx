// app/dashboard/page.tsx

'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Package, 
  ArrowRight,
  Settings,
  Bell,
  Search,
  Plus,
  Home,
  Warehouse,
  Hospital,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Calendar,
  FileText,
  Menu,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Mock Data
const userOrganizations = [
  {
    id: '1',
    name: 'โรงพยาบาลศิริราช',
    slug: 'siriraj-hospital',
    description: 'ระบบจัดการสต็อกยาโรงพยาบาลศิริราช',
    logo: null,
    memberCount: 45,
    departmentCount: 8,
    status: 'ACTIVE',
    isOwner: true,
    role: 'เจ้าขององค์กร',
    lastActivity: '2025-01-13',
    stats: {
      products: 1250,
      lowStock: 23,
      pendingTransfers: 5
    }
  },
  {
    id: '2', 
    name: 'ร้านยาชุมชนสุขภาพดี',
    slug: 'pharmacy-sukhapdi',
    description: 'ระบบจัดการสต็อกยาร้านยาชุมชน',
    logo: null,
    memberCount: 12,
    departmentCount: 3,
    status: 'ACTIVE',
    isOwner: false,
    role: 'ผู้จัดการสินค้า',
    lastActivity: '2025-01-12',
    stats: {
      products: 450,
      lowStock: 8,
      pendingTransfers: 2
    }
  },
  {
    id: '3',
    name: 'โรงงานผลิตยา ABC Pharma',
    slug: 'abc-pharma',
    description: 'ระบบจัดการสต็อกวัตถุดิบและผลิตภัณฑ์',
    logo: null,
    memberCount: 120,
    departmentCount: 15,
    status: 'ACTIVE',
    isOwner: false,
    role: 'พนักงานคลัง',
    lastActivity: '2025-01-10',
    stats: {
      products: 2800,
      lowStock: 45,
      pendingTransfers: 12
    }
  }
];

const mockDepartments = [
  {
    id: '1',
    name: 'คลังยาหลัก',
    code: 'MAIN',
    icon: 'Warehouse',
    color: 'blue',
    description: 'คลังยาหลักของโรงพยาบาล',
    memberCount: 8,
    isActive: true,
    notifications: 3
  },
  {
    id: '2',
    name: 'ห้องฉุกเฉิน (ER)',
    code: 'ER',
    icon: 'Hospital',
    color: 'red',
    description: 'แผนกฉุกเฉินและการแพทย์ฉุกเฉิน',
    memberCount: 12,
    isActive: true,
    notifications: 0
  },
  {
    id: '3',
    name: 'หอผู้ป่วยใน (IPD)',
    code: 'IPD',
    icon: 'Building2',
    color: 'green',
    description: 'หอผู้ป่วยในทั่วไป',
    memberCount: 25,
    isActive: true,
    notifications: 1
  },
  {
    id: '4',
    name: 'ผู้ป่วยนอก (OPD)',
    code: 'OPD', 
    icon: 'Users',
    color: 'purple',
    description: 'แผนกผู้ป่วยนอก',
    memberCount: 15,
    isActive: true,
    notifications: 0
  },
  {
    id: '5',
    name: 'ห้องผ่าตัด (OR)',
    code: 'OR',
    icon: 'ShoppingCart',
    color: 'orange',
    description: 'ห้องผ่าตัดและอุปกรณ์การแพทย์',
    memberCount: 18,
    isActive: true,
    notifications: 2
  }
];

const getIconComponent = (iconName) => {
  const icons = {
    Warehouse, Hospital, Building2, Users, ShoppingCart, Package
  };
  return icons[iconName] || Package;
};

const getColorClass = (color) => {
  const colors = {
    blue: 'bg-blue-500',
    red: 'bg-red-500', 
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };
  return colors[color] || 'bg-gray-500';
};

function OrganizationSelector({ organizations, onSelectOrganization }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">InvenStock</h1>
              <p className="text-sm text-gray-600">Multi-Tenant Inventory System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                placeholder="ค้นหาองค์กร..." 
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="icon">
              <Bell className="w-4 h-4" />
            </Button>
            <Avatar>
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            เลือกองค์กรที่ต้องการเข้าใช้งาน
          </h2>
          <p className="text-gray-600">
            คุณเป็นสมาชิกของ {organizations.length} องค์กร
          </p>
        </div>

        {/* Organization Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {organizations.map((org) => (
            <Card 
              key={org.id}
              className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-0 bg-white/80 backdrop-blur-sm"
              onClick={() => onSelectOrganization(org)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight mb-1">
                        {org.name}
                      </CardTitle>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {org.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Role Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant={org.isOwner ? "default" : "secondary"} className="text-xs">
                    {org.role}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {org.status}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {org.stats.products.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">สินค้า</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">
                      {org.stats.lowStock}
                    </div>
                    <div className="text-xs text-gray-500">ใกล้หมด</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {org.stats.pendingTransfers}
                    </div>
                    <div className="text-xs text-gray-500">รอดำเนินการ</div>
                  </div>
                </div>

                {/* Organization Info */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{org.memberCount} สมาชิก</span>
                  <span>{org.departmentCount} แผนก</span>
                  <span>อัปเดต {org.lastActivity}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create New Organization */}
        <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              สร้างองค์กรใหม่
            </h3>
            <p className="text-gray-500 text-center mb-4">
              เริ่มต้นการจัดการสต็อกสินค้าสำหรับองค์กรของคุณ
            </p>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              สร้างองค์กร
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function OrganizationDashboard({ organization, departments, onBack }) {
  const [activeDepartment, setActiveDepartment] = useState(departments[0]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-200 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-sm leading-tight">
                    {organization.name}
                  </h2>
                  <p className="text-xs text-gray-500">{organization.role}</p>
                </div>
              </div>
            )}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-3">
          {sidebarOpen && (
            <Button 
              variant="outline" 
              onClick={onBack}
              className="w-full justify-start mb-4 text-sm"
            >
              ← กลับไปเลือกองค์กร
            </Button>
          )}

          {/* Main Menu */}
          <div className="space-y-1">
            <div className={`${sidebarOpen ? 'px-3 py-1' : 'px-2 py-1'} text-xs font-semibold text-gray-500 uppercase tracking-wider`}>
              {sidebarOpen ? 'หน้าหลัก' : '•'}
            </div>
            
            <Button variant="ghost" className={`${sidebarOpen ? 'w-full justify-start' : 'w-full justify-center'} h-9`}>
              <Home className="w-4 h-4" />
              {sidebarOpen && <span className="ml-2">แดชบอร์ด</span>}
            </Button>
            
            <Button variant="ghost" className={`${sidebarOpen ? 'w-full justify-start' : 'w-full justify-center'} h-9`}>
              <TrendingUp className="w-4 h-4" />
              {sidebarOpen && <span className="ml-2">รายงาน</span>}
            </Button>
            
            <Button variant="ghost" className={`${sidebarOpen ? 'w-full justify-start' : 'w-full justify-center'} h-9`}>
              <Settings className="w-4 h-4" />
              {sidebarOpen && <span className="ml-2">ตั้งค่า</span>}
            </Button>
          </div>

          {/* Departments */}
          <div className="mt-6 space-y-1">
            <div className={`${sidebarOpen ? 'px-3 py-1' : 'px-2 py-1'} text-xs font-semibold text-gray-500 uppercase tracking-wider`}>
              {sidebarOpen ? 'แผนกทั้งหมด' : '••'}
            </div>
            
            {departments.map((dept) => {
              const IconComponent = getIconComponent(dept.icon);
              const isActive = activeDepartment?.id === dept.id;
              
              return (
                <Button
                  key={dept.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className={`${sidebarOpen ? 'w-full justify-start' : 'w-full justify-center'} h-9 relative`}
                  onClick={() => setActiveDepartment(dept)}
                >
                  <div className={`w-6 h-6 ${getColorClass(dept.color)} rounded flex items-center justify-center mr-${sidebarOpen ? '2' : '0'}`}>
                    <IconComponent className="w-3 h-3 text-white" />
                  </div>
                  {sidebarOpen && (
                    <>
                      <span className="ml-2 flex-1 text-left">{dept.name}</span>
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
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 ${getColorClass(activeDepartment?.color)} rounded flex items-center justify-center`}>
                {React.createElement(getIconComponent(activeDepartment?.icon), { className: "w-4 h-4 text-white" })}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {activeDepartment?.name}
                </h1>
                <p className="text-sm text-gray-600">
                  {activeDepartment?.description}
                </p>
              </div>
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

        {/* Department Content */}
        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Quick Stats */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">สินค้าทั้งหมด</p>
                    <p className="text-2xl font-bold text-gray-900">1,247</p>
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
                    <p className="text-2xl font-bold text-orange-600">23</p>
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
                    <p className="text-2xl font-bold text-blue-600">5</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">สมาชิก</p>
                    <p className="text-2xl font-bold text-green-600">{activeDepartment?.memberCount}</p>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Department Specific Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>กิจกรรมล่าสุด</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Package className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">เพิ่มสินค้าใหม่: Paracetamol 500mg</p>
                      <p className="text-xs text-gray-500">2 ชั่วโมงที่แล้ว</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">แจ้งเตือน: Amoxicillin ใกล้หมด</p>
                      <p className="text-xs text-gray-500">4 ชั่วโมงที่แล้ว</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>รายการรอดำเนินการ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">ใบเบิก #TRF-001</p>
                      <p className="text-xs text-gray-500">จาก OPD → ER</p>
                    </div>
                    <Badge variant="outline">รออนุมัติ</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">ตรวจนับสต็อก</p>
                      <p className="text-xs text-gray-500">กำหนดวันนี้</p>
                    </div>
                    <Badge variant="outline">ค้างการทำ</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function InvenStockDashboard() {
  const [selectedOrganization, setSelectedOrganization] = useState(null);

  return (
    <div>
      {!selectedOrganization ? (
        <OrganizationSelector 
          organizations={userOrganizations}
          onSelectOrganization={setSelectedOrganization}
        />
      ) : (
        <OrganizationDashboard 
          organization={selectedOrganization}
          departments={mockDepartments}
          onBack={() => setSelectedOrganization(null)}
        />
      )}
    </div>
  );
}