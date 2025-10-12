// lib/audit-helpers.ts
// UPDATED: Extract user name from userSnapshot instead of user relation

import { 
  Package, UserPlus, Edit, Trash2, CheckCircle, 
  AlertTriangle, TrendingUp, Building2, Users,
  FileText, Settings, Shield, ArrowRightLeft, User, Lock,
  type LucideIcon 
} from 'lucide-react';

// ✅ UPDATED: Define proper UserSnapshot type
interface UserSnapshot {
  userId: string;
  username: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  [key: string]: string | undefined;
}

// ✅ UPDATED: Add userSnapshot field with proper type
export interface AuditLog {
  id: string;
  action: string;
  category: string;
  severity: string;
  description: string;
  createdAt: Date | string;
  userSnapshot?: UserSnapshot | string | null;  // ✅ Proper type for userSnapshot
  department?: {
    name: string;
  } | null;
  organizationId?: string | null;
}

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

export function getActivityIcon(category: string, action: string): LucideIcon {
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

  if (action.includes('create')) return UserPlus;
  if (action.includes('update')) return Edit;
  if (action.includes('delete')) return Trash2;
  if (action.includes('approve')) return CheckCircle;
  if (action.includes('reject')) return AlertTriangle;
  if (action.includes('profile')) return User;
  if (action.includes('password')) return Lock;
  
  return categoryIcons[category] || FileText;
}

export function getActivityStatus(severity: string): 'success' | 'warning' | 'info' | 'error' {
  const statusMap: Record<string, 'success' | 'warning' | 'info' | 'error'> = {
    INFO: 'info',
    WARNING: 'warning',
    CRITICAL: 'error',
  };
  
  return statusMap[severity] || 'info';
}

export function formatActivityTime(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting activity time:', error);
    return 'ไม่ระบุเวลา';
  }
}

export function getActivityTitle(action: string, category: string): string {
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
    'user.profile_updated': 'อัพเดทข้อมูลโปรไฟล์',
    'user.password_changed': 'เปลี่ยนรหัสผ่าน',
    'user.password_change_failed': 'พยายามเปลี่ยนรหัสผ่านล้มเหลว',
    'user.login': 'เข้าสู่ระบบ',
    'user.logout': 'ออกจากระบบ',
    'user.login_failed': 'พยายามเข้าสู่ระบบล้มเหลว',
  };

  return titles[action] || `${category}: ${action}`;
}

// ✅ NEW: Extract user name from snapshot with proper typing
function extractUserNameFromSnapshot(snapshot: UserSnapshot | string | null | undefined): string {
  if (!snapshot) return 'ระบบ';
  
  try {
    // Handle string JSON
    const data: UserSnapshot = typeof snapshot === 'string' 
      ? JSON.parse(snapshot) 
      : snapshot;
    
    // Extract fullName or construct from firstName/lastName
    if (data.fullName) {
      return data.fullName;
    }
    
    if (data.firstName && data.lastName) {
      return `${data.firstName} ${data.lastName}`;
    }
    
    // Fallback to username
    if (data.username) {
      return data.username;
    }
    
    return 'ผู้ใช้ที่ถูกลบ';
  } catch (error) {
    console.error('Error parsing user snapshot:', error);
    return 'ระบบ';
  }
}

/**
 * ✅ UPDATED: Extract user name from userSnapshot
 */
export function transformAuditLogToActivity(log: AuditLog): Activity {
  const userName = extractUserNameFromSnapshot(log.userSnapshot);

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

export function transformAuditLogsToActivities(logs: AuditLog[]): Activity[] {
  return logs.map(transformAuditLogToActivity);
}

export function filterOrganizationLogs(logs: AuditLog[]): AuditLog[] {
  return logs.filter(log => log.organizationId !== null && log.organizationId !== undefined);
}

export function filterUserLogs(logs: AuditLog[]): AuditLog[] {
  return logs.filter(log => !log.organizationId);
}

export function groupLogsByCategory(logs: AuditLog[]): Record<string, AuditLog[]> {
  return logs.reduce((acc, log) => {
    const category = log.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(log);
    return acc;
  }, {} as Record<string, AuditLog[]>);
}

export function getLogsSummaryBySeverity(logs: AuditLog[]): {
  info: number;
  warning: number;
  critical: number;
  total: number;
} {
  const summary = {
    info: 0,
    warning: 0,
    critical: 0,
    total: logs.length,
  };

  logs.forEach(log => {
    const severity = log.severity.toLowerCase();
    if (severity === 'info') summary.info++;
    else if (severity === 'warning') summary.warning++;
    else if (severity === 'critical') summary.critical++;
  });

  return summary;
}