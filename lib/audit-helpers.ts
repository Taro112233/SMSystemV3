// lib/audit-helpers.ts
// Audit Log Helper Functions - Transform audit logs to activity format
// ============================================

import { 
  Package, UserPlus, Edit, Trash2, CheckCircle, 
  AlertTriangle, TrendingUp, Building2, Users,
  FileText, Settings, Shield, ArrowRightLeft,
  type LucideIcon 
} from 'lucide-react';

// ✅ Types matching AuditLog schema
export interface AuditLog {
  id: string;
  action: string;
  category: string;
  severity: string;
  description: string;
  createdAt: Date | string;
  user?: {
    firstName: string;
    lastName: string;
  } | null;
  department?: {
    name: string;
  } | null;
}

// ✅ Activity format for frontend
export interface Activity {
  id: string;
  type: string;
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
  status: 'success' | 'warning' | 'info' | 'error';
  user: string;
}

/**
 * Get Lucide icon based on audit category and action
 */
export function getActivityIcon(category: string, action: string): LucideIcon {
  // Category-based icons
  const categoryIcons: Record<string, LucideIcon> = {
    PRODUCT: Package,
    STOCK: TrendingUp,
    TRANSFER: ArrowRightLeft,
    USER: Users,
    ORGANIZATION: Building2,
    DEPARTMENT: Building2,
    AUTH: Shield,
    SYSTEM: Settings,
  };

  // Action-specific overrides
  if (action.includes('create')) return UserPlus;
  if (action.includes('update')) return Edit;
  if (action.includes('delete')) return Trash2;
  if (action.includes('approve')) return CheckCircle;
  if (action.includes('reject')) return AlertTriangle;
  
  return categoryIcons[category] || FileText;
}

/**
 * Map severity to activity status color
 */
export function getActivityStatus(severity: string): 'success' | 'warning' | 'info' | 'error' {
  const statusMap: Record<string, 'success' | 'warning' | 'info' | 'error'> = {
    INFO: 'info',
    WARNING: 'warning',
    CRITICAL: 'error',
  };
  
  return statusMap[severity] || 'info';
}

/**
 * Format activity time as absolute datetime
 * Format: "4/10/2025 16:00"
 */
export function formatActivityTime(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1; // 0-indexed
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting activity time:', error);
    return 'ไม่ระบุเวลา';
  }
}

/**
 * Get activity title from action
 */
export function getActivityTitle(action: string, category: string): string {
  // Simple Thai translations for common actions
  const titles: Record<string, string> = {
    'products.create': 'สร้างสินค้าใหม่',
    'products.update': 'แก้ไขข้อมูลสินค้า',
    'products.delete': 'ลบสินค้า',
    'departments.create': 'สร้างหน่วยงานใหม่',
    'departments.update': 'แก้ไขหน่วยงาน',
    'departments.delete': 'ลบหน่วยงาน',
    'members.role_updated': 'เปลี่ยนบทบาทสมาชิก',
    'members.removed': 'ลบสมาชิก',
    'members.joined_by_code': 'สมาชิกใหม่เข้าร่วม',
    'organization.create': 'สร้างองค์กร',
    'organization.settings_updated': 'แก้ไขการตั้งค่าองค์กร',
    'stocks.adjust': 'ปรับปรุงสต็อก',
    'transfers.create': 'สร้างคำขอโอนสินค้า',
    'transfers.approve': 'อนุมัติการโอนสินค้า',
  };

  return titles[action] || `${category}: ${action}`;
}

/**
 * Transform AuditLog to Activity format
 */
export function transformAuditLogToActivity(log: AuditLog): Activity {
  const userName = log.user 
    ? `${log.user.firstName} ${log.user.lastName}`
    : 'ระบบ';

  return {
    id: log.id,
    type: log.action,
    icon: getActivityIcon(log.category, log.action),
    title: getActivityTitle(log.action, log.category),
    description: log.description,
    time: formatActivityTime(log.createdAt),
    status: getActivityStatus(log.severity),
    user: userName,
  };
}

/**
 * Transform multiple audit logs to activities
 */
export function transformAuditLogsToActivities(logs: AuditLog[]): Activity[] {
  return logs.map(transformAuditLogToActivity);
}