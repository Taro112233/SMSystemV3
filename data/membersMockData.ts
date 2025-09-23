// data/membersMockData.ts
// Mock data for members management components

import {
  User, Shield, Crown, UserCheck, Mail, Phone, Calendar, Activity
} from 'lucide-react';

export const organizationMembers = [
  {
    id: 'user-001',
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    fullName: 'สมชาย ใจดี',
    username: 'somchai.jaidee',
    email: 'somchai@siriraj.ac.th',
    phone: '081-234-5678',
    avatar: null,
    status: 'ACTIVE',
    isActive: true,
    emailVerified: true,
    role: 'OWNER' as const,
    isOwner: true,
    joinedAt: new Date('2024-01-15'),
    lastActiveAt: new Date('2025-01-23T10:30:00'),
    lastLogin: new Date('2025-01-23T09:15:00'),
    departmentAccess: ['คลังยาหลัก', 'ร้านยา'],
    permissions: ['*'], // Full access
    createdBy: 'system',
    invitedBy: null
  },
  {
    id: 'user-002',
    firstName: 'มาลี',
    lastName: 'รักษา',
    fullName: 'นางสาวมาลี รักษา',
    username: 'malee.raksa',
    email: 'malee@siriraj.ac.th',
    phone: '081-345-6789',
    avatar: null,
    status: 'ACTIVE',
    isActive: true,
    emailVerified: true,
    role: 'ADMIN' as const,
    isOwner: false,
    joinedAt: new Date('2024-02-10'),
    lastActiveAt: new Date('2025-01-23T11:45:00'),
    lastLogin: new Date('2025-01-23T08:30:00'),
    departmentAccess: ['ห้องฉุกเฉิน (ER)', 'ICU'],
    permissions: ['users.invite', 'transfers.approve', 'products.manage'],
    createdBy: 'user-001',
    invitedBy: 'สมชาย ใจดี'
  },
  {
    id: 'user-003',
    firstName: 'ประยุทธ',
    lastName: 'ดูแล',
    fullName: 'นายประยุทธ ดูแล',
    username: 'prayuth.dulae',
    email: 'prayuth@siriraj.ac.th',
    phone: '081-456-7890',
    avatar: null,
    status: 'ACTIVE',
    isActive: true,
    emailVerified: true,
    role: 'ADMIN' as const,
    isOwner: false,
    joinedAt: new Date('2024-02-20'),
    lastActiveAt: new Date('2025-01-23T09:20:00'),
    lastLogin: new Date('2025-01-22T16:45:00'),
    departmentAccess: ['หอผู้ป่วยใน (IPD)', 'ห้องผ่าตัด (OR)'],
    permissions: ['users.invite', 'transfers.approve', 'products.manage'],
    createdBy: 'user-001',
    invitedBy: 'สมชาย ใจดี'
  },
  {
    id: 'user-004',
    firstName: 'สุดา',
    lastName: 'อบอุ่น',
    fullName: 'นางสาวสุดา อบอุ่น',
    username: 'suda.ab-oun',
    email: 'suda@siriraj.ac.th',
    phone: '081-567-8901',
    avatar: null,
    status: 'ACTIVE',
    isActive: true,
    emailVerified: true,
    role: 'MEMBER' as const,
    isOwner: false,
    joinedAt: new Date('2024-03-15'),
    lastActiveAt: new Date('2025-01-23T10:15:00'),
    lastLogin: new Date('2025-01-23T07:30:00'),
    departmentAccess: ['ผู้ป่วยนอก (OPD)'],
    permissions: ['stocks.read', 'stocks.adjust', 'transfers.create'],
    createdBy: 'user-002',
    invitedBy: 'นางสาวมาลี รักษา'
  },
  {
    id: 'user-005',
    firstName: 'วิทยา',
    lastName: 'วิเคราะห์',
    fullName: 'นางสาววิทยา วิเคราะห์',
    username: 'wittaya.wicara',
    email: 'wittaya@siriraj.ac.th',
    phone: '081-678-9012',
    avatar: null,
    status: 'ACTIVE',
    isActive: true,
    emailVerified: true,
    role: 'MEMBER' as const,
    isOwner: false,
    joinedAt: new Date('2024-04-01'),
    lastActiveAt: new Date('2025-01-22T17:30:00'),
    lastLogin: new Date('2025-01-22T15:20:00'),
    departmentAccess: ['ห้องปฏิบัติการ (LAB)'],
    permissions: ['stocks.read', 'stocks.adjust', 'transfers.create'],
    createdBy: 'user-001',
    invitedBy: 'สมชาย ใจดี'
  },
  {
    id: 'user-006',
    firstName: 'เภสัช',
    lastName: 'จ่ายยา',
    fullName: 'นางสาวเภสัช จ่ายยา',
    username: 'pharma.jaiya',
    email: 'pharma@siriraj.ac.th',
    phone: '081-789-0123',
    avatar: null,
    status: 'PENDING',
    isActive: false,
    emailVerified: false,
    role: 'MEMBER' as const,
    isOwner: false,
    joinedAt: new Date('2025-01-20'),
    lastActiveAt: null,
    lastLogin: null,
    departmentAccess: ['ร้านยา (PHARMACY)'],
    permissions: ['stocks.read'],
    createdBy: 'user-002',
    invitedBy: 'นางสาวมาลี รักษา'
  },
  {
    id: 'user-007',
    firstName: 'วิกฤต',
    lastName: 'ช่วยชีวิต',
    fullName: 'นายวิกฤต ช่วยชีวิต',
    username: 'wikrid.rescue',
    email: 'wikrid@siriraj.ac.th',
    phone: '081-890-1234',
    avatar: null,
    status: 'SUSPENDED',
    isActive: false,
    emailVerified: true,
    role: 'MEMBER' as const,
    isOwner: false,
    joinedAt: new Date('2024-05-10'),
    lastActiveAt: new Date('2025-01-15T14:20:00'),
    lastLogin: new Date('2025-01-15T12:10:00'),
    departmentAccess: ['ICU'],
    permissions: [],
    createdBy: 'user-001',
    invitedBy: 'สมชาย ใจดี'
  }
];

export const memberStats = {
  total: organizationMembers.length,
  active: organizationMembers.filter(m => m.status === 'ACTIVE').length,
  pending: organizationMembers.filter(m => m.status === 'PENDING').length,
  suspended: organizationMembers.filter(m => m.status === 'SUSPENDED').length,
  owners: organizationMembers.filter(m => m.role === 'OWNER').length,
  admins: organizationMembers.filter(m => m.role === 'ADMIN').length,
  members: organizationMembers.filter(m => m.role === 'MEMBER').length,
  emailVerified: organizationMembers.filter(m => m.emailVerified).length
};

export const roleConfig = {
  OWNER: {
    label: 'เจ้าของ',
    icon: Crown,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    permissions: ['จัดการทุกอย่าง', 'เปลี่ยนเจ้าของได้']
  },
  ADMIN: {
    label: 'ผู้จัดการ',
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    permissions: ['เชิญสมาชิก', 'อนุมัติการเบิก', 'จัดการสินค้า']
  },
  MEMBER: {
    label: 'สมาชิก',
    icon: User,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    permissions: ['ดูสต็อก', 'ปรับสต็อก', 'สร้างใบเบิก']
  }
};

export const statusConfig = {
  ACTIVE: {
    label: 'ใช้งาน',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: UserCheck
  },
  PENDING: {
    label: 'รอยืนยัน',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: Calendar
  },
  SUSPENDED: {
    label: 'ระงับ',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: Activity
  },
  INACTIVE: {
    label: 'ไม่ใช้งาน',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: User
  }
};