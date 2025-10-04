// lib/department-helpers.ts - Department Helper Functions
// Helper functions for mapping department data from database to frontend

import { 
  Building, Hospital, Warehouse, TestTube, Pill,
  Activity, Stethoscope, Users, Package, Shield,
  Circle, Square, Triangle, Star, Heart, Crown,
  Eye, Settings, Folder, Tag, Box,
  LucideIcon
} from 'lucide-react';

/**
 * Database Department type (from API) - Updated to match API response format
 */
interface DatabaseDepartment {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  isActive: boolean;
  parentId: string | null;
  createdAt: Date | string;    // API may return string dates
  updatedAt: Date | string;    // API may return string dates
}

/**
 * Frontend Department type (for components)
 */
interface FrontendDepartment {
  id: string;
  name: string;
  code: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
  parentId?: string;
  
  // Additional frontend fields (calculated or mock)
  memberCount: number;
  stockItems: number;
  lowStock: number;
  notifications: number;
  manager: string;
  lastActivity: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ✅ Map ColorTheme enum to Tailwind classes
 */
export function mapColorThemeToTailwind(colorTheme: string | null | undefined): string {
  if (!colorTheme) {
    return 'bg-gray-500';
  }
  
  const colorMap: Record<string, string> = {
    BLUE: 'bg-blue-500',
    GREEN: 'bg-green-500',
    RED: 'bg-red-500',
    YELLOW: 'bg-yellow-500',
    PURPLE: 'bg-purple-500',
    PINK: 'bg-pink-500',
    INDIGO: 'bg-indigo-500',
    TEAL: 'bg-teal-500',
    ORANGE: 'bg-orange-500',
    GRAY: 'bg-gray-500',
    SLATE: 'bg-slate-500',
    EMERALD: 'bg-emerald-500',
  };

  const normalizedColor = colorTheme.toUpperCase();
  return colorMap[normalizedColor] || 'bg-gray-500';
}

/**
 * ✅ Get React component from icon string
 */
export function getIconComponent(iconString: string): LucideIcon {  // ✅ แก้ return type
  const iconMap: Record<string, LucideIcon> = {  // ✅ แก้จาก any
    'BUILDING': Building,
    'HOSPITAL': Hospital,
    'PHARMACY': Pill,
    'WAREHOUSE': Warehouse,
    'LABORATORY': TestTube,
    'PILL': Pill,
    'BOTTLE': Package,
    'SYRINGE': Activity,
    'BANDAGE': Shield,
    'STETHOSCOPE': Stethoscope,
    'CROWN': Crown,
    'SHIELD': Shield,
    'PERSON': Users,
    'EYE': Eye,
    'GEAR': Settings,
    'BOX': Box,
    'FOLDER': Folder,
    'TAG': Tag,
    'STAR': Star,
    'HEART': Heart,
    'CIRCLE': Circle,
    'SQUARE': Square,
    'TRIANGLE': Triangle,
  };
  
  return iconMap[iconString.toUpperCase()] || Building;
}

/**
 * Get department category from icon and name
 */
export function getDepartmentCategory(icon: string, name: string): string {
  const clinicalIcons = ['HOSPITAL', 'STETHOSCOPE', 'HEART', 'PILL'];
  const mainIcons = ['WAREHOUSE', 'BUILDING'];
  
  if (clinicalIcons.includes(icon.toUpperCase())) return 'clinical';
  if (mainIcons.includes(icon.toUpperCase())) return 'main';
  
  // Fallback to name matching
  const clinicalKeywords = ['ฉุกเฉิน', 'ผู้ป่วย', 'ผ่าตัด', 'แรงดัน', 'หอ'];
  const mainKeywords = ['คลัง', 'หลัก', 'จ่าย'];
  
  const nameLower = name.toLowerCase();
  if (clinicalKeywords.some(keyword => nameLower.includes(keyword))) return 'clinical';
  if (mainKeywords.some(keyword => nameLower.includes(keyword))) return 'main';
  
  return 'support';
}

/**
 * ✅ Transform database department to frontend format (handles null values + string dates)
 */
export function transformDepartmentData(dept: DatabaseDepartment): FrontendDepartment {
  // Handle date conversion safely
  const getISOString = (dateValue: Date | string | null | undefined): string => {  // ✅ แก้จาก any
    if (!dateValue) return new Date().toISOString();
    if (typeof dateValue === 'string') return dateValue;
    if (dateValue instanceof Date) return dateValue.toISOString();
    return new Date().toISOString();
  };

  return {
    id: dept.id,
    name: dept.name,
    code: dept.slug,                                    // Map slug to code for frontend
    slug: dept.slug,                                    // Keep original slug
    description: dept.description || `หน่วยงาน ${dept.name}`,
    color: mapColorThemeToTailwind(dept.color),         // Handles null values
    icon: dept.icon || 'BUILDING',                      // Default icon if null
    isActive: dept.isActive,
    parentId: dept.parentId || undefined,               // Convert null to undefined
    
    // Mock data for now (will be replaced with real stock/user data later)
    memberCount: Math.floor(Math.random() * 20) + 5,
    stockItems: Math.floor(Math.random() * 200) + 50,
    lowStock: Math.floor(Math.random() * 10),
    notifications: Math.floor(Math.random() * 5),
    manager: 'ไม่ระบุ',
    lastActivity: getISOString(dept.updatedAt),          // Safe date conversion
    category: getDepartmentCategory(dept.icon || 'BUILDING', dept.name),
    createdAt: dept.createdAt instanceof Date ? dept.createdAt : new Date(dept.createdAt),
    updatedAt: dept.updatedAt instanceof Date ? dept.updatedAt : new Date(dept.updatedAt),
  };
}

/**
 * ✅ Find department by slug in frontend array
 */
export function findDepartmentBySlug(departments: FrontendDepartment[], deptSlug: string): FrontendDepartment | null {
  if (!departments || !Array.isArray(departments)) {
    console.warn('Invalid departments array:', departments);
    return null;
  }

  // Try exact slug match first
  let found = departments.find(dept => dept.slug.toLowerCase() === deptSlug.toLowerCase());
  
  // Fallback to code match
  if (!found) {
    found = departments.find(dept => dept.code.toLowerCase() === deptSlug.toLowerCase());
  }
  
  return found || null;
}

/**
 * Get available color options for department creation
 */
export function getAvailableColors() {
  return [
    { value: 'BLUE', label: 'น้ำเงิน', class: 'bg-blue-500' },
    { value: 'GREEN', label: 'เขียว', class: 'bg-green-500' },
    { value: 'RED', label: 'แดง', class: 'bg-red-500' },
    { value: 'YELLOW', label: 'เหลือง', class: 'bg-yellow-500' },
    { value: 'PURPLE', label: 'ม่วง', class: 'bg-purple-500' },
    { value: 'PINK', label: 'ชมพู', class: 'bg-pink-500' },
    { value: 'INDIGO', label: 'น้ำเงินเข้ม', class: 'bg-indigo-500' },
    { value: 'TEAL', label: 'เขียวฟ้า', class: 'bg-teal-500' },
    { value: 'ORANGE', label: 'ส้ม', class: 'bg-orange-500' },
    { value: 'GRAY', label: 'เทา', class: 'bg-gray-500' },
  ];
}

/**
 * Get available icon options for department creation
 */
export function getAvailableIcons() {
  return [
    { value: 'BUILDING', label: 'อาคาร', component: Building },
    { value: 'HOSPITAL', label: 'โรงพยาบาล', component: Hospital },
    { value: 'PHARMACY', label: 'ร้านยา', component: Pill },
    { value: 'WAREHOUSE', label: 'คลังสินค้า', component: Warehouse },
    { value: 'LABORATORY', label: 'ห้องแล็บ', component: TestTube },
    { value: 'STETHOSCOPE', label: 'เครื่องมือแพทย์', component: Stethoscope },
    { value: 'PERSON', label: 'บุคคล', component: Users },
    { value: 'SHIELD', label: 'โล่', component: Shield },
    { value: 'GEAR', label: 'เฟือง', component: Settings },
    { value: 'BOX', label: 'กล่อง', component: Box },
    { value: 'HEART', label: 'หัวใจ', component: Heart },
    { value: 'PILL', label: 'ยาเม็ด', component: Pill },
  ];
}

/**
 * Type guard functions
 */
export function isValidColorTheme(color: string): boolean {
  const validColors = [
    'BLUE', 'GREEN', 'RED', 'YELLOW', 'PURPLE', 'PINK',
    'INDIGO', 'TEAL', 'ORANGE', 'GRAY', 'SLATE', 'EMERALD'
  ];
  return validColors.includes(color.toUpperCase());
}

export function isValidIconType(icon: string): boolean {
  const validIcons = [
    'BUILDING', 'HOSPITAL', 'PHARMACY', 'WAREHOUSE', 'LABORATORY',
    'PILL', 'BOTTLE', 'SYRINGE', 'BANDAGE', 'STETHOSCOPE',
    'CROWN', 'SHIELD', 'PERSON', 'EYE', 'GEAR',
    'BOX', 'FOLDER', 'TAG', 'STAR', 'HEART', 'CIRCLE', 'SQUARE', 'TRIANGLE'
  ];
  return validIcons.includes(icon.toUpperCase());
}

/**
 * ✅ Export types for TypeScript
 */
export type { DatabaseDepartment, FrontendDepartment };