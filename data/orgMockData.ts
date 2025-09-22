// app/org/[orgSlug]/data/mockData.ts
// Mock data for organization dashboard components

import {
  Warehouse, Hospital, Users, ShoppingCart, TestTube, Pill, Activity, Stethoscope,
  ArrowLeft, AlertTriangle, Edit, UserPlus
} from 'lucide-react';

export const organization = {
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

export const departments = [
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
    lastActivity: '12 กันยายน 2568 เวลา 09:49:42',
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
    lastActivity: '12 กันยายน 2568 เวลา 09:49:42',
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
    lastActivity: '12 กันยายน 2568 เวลา 09:49:42',
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
    lastActivity: '12 กันยายน 2568 เวลา 09:49:42',
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
    lastActivity: '12 กันยายน 2568 เวลา 09:49:42',
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
    lastActivity: '12 กันยายน 2568 เวลา 09:49:42',
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
    lastActivity: '12 กันยายน 2568 เวลา 09:49:42',
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
    lastActivity: '12 กันยายน 2568 เวลา 09:49:42',
    manager: 'นายวิกฤต ช่วยชีวิต',
    category: 'clinical'
  }
];

export const recentActivities = [
  {
    id: 1,
    type: 'transfer',
    icon: ArrowLeft,
    title: 'การโอนยาระหว่างแผนก',
    description: 'ER → ICU: Epinephrine 10 หลอด',
    time: '12 กันยายน 2568 เวลา 09:49:42',
    status: 'pending',
    user: 'นายสมชาย ใจดี'
  },
  {
    id: 2,
    type: 'stock',
    icon: AlertTriangle,
    title: 'แจ้งเตือนสต็อกต่ำ',
    description: 'Morphine ในแผนก OR เหลือ 5 หลอด',
    time: '12 กันยายน 2568 เวลา 09:49:42',
    status: 'warning',
    user: 'ระบบอัตโนมัติ'
  },
  {
    id: 3,
    type: 'adjustment',
    icon: Edit,
    title: 'ปรับสต็อกสินค้า',
    description: 'ปรับยอดยา Paracetamol ในคลังหลัก +200 เม็ด',
    time: '12 กันยายน 2568 เวลา 09:49:42',
    status: 'completed',
    user: 'นางสาวมาลี รักษา'
  },
  {
    id: 4,
    type: 'user',
    icon: UserPlus,
    title: 'เพิ่มสมาชิกใหม่',
    description: 'เพิ่มพยาบาลใหม่เข้าแผนก IPD',
    time: '12 กันยายน 2568 เวลา 09:49:42',
    status: 'completed',
    user: 'นายประยุทธ ดูแล'
  }
];