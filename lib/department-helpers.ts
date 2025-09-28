// lib/department-helpers.ts - UPDATED FOR SEEDED DATA
// Helper functions for mapping department data from database to frontend

import { 
  Building, Hospital, Warehouse, TestTube, Pill,
  Activity, Stethoscope, Users, Package, Shield,
  Circle, Square, Triangle, Star, Heart, Crown,
  Eye, Settings, Folder, Tag, Box
} from 'lucide-react';

/**
 * ✅ Map ColorTheme enum with validation (matches seeded data)
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
 * ✅ Get React component from icon string (matches seeded data)
 */
export function getIconComponent(iconString: string) {
  const iconMap: Record<string, any> = {
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
  
  return iconMap[iconString] || Building;
}

/**
 * Get department category based on slug and name (matches seeded data)
 */
export function getDepartmentCategory(iconType: string | null | undefined, name: string): string {
  const slug = name.toLowerCase();
  
  // Clinical keywords from seeded data
  const clinicalKeywords = ['icu', 'ipd', 'opd', 'ห้องฉุกเฉิน', 'ผู้ป่วย', 'ห้องผ่าตัด', 'ห้องตรวจ'];
  const supportKeywords = ['ห้องปฏิบัติการ', 'lab', 'คลัง', 'ห้องยา', 'pharmacy'];
  const mainKeywords = ['คลังยาหลัก', 'main'];
  
  if (mainKeywords.some(keyword => slug.includes(keyword))) {
    return 'main';
  }
  
  if (clinicalKeywords.some(keyword => slug.includes(keyword))) {
    return 'clinical';
  }
  
  if (supportKeywords.some(keyword => slug.includes(keyword))) {
    return 'support';
  }
  
  return 'support';
}

/**
 * Database Department interface (from seeded data structure)
 */
export interface DatabaseDepartment {
  id: string;
  name: string;
  slug: string;                   // This is what we have in seeded data
  description: string | null;
  color: string | null;
  icon: string | null;
  parentId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  organizationId: string;
}

/**
 * Frontend Department interface
 */
export interface FrontendDepartment {
  id: string;
  name: string;
  code: string;                   // Map from slug for frontend compatibility
  slug: string;                   // Original slug
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
  parentId: string | null;
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
 * ✅ Transform department data from seeded database structure
 */
export function transformDepartmentData(dept: DatabaseDepartment): FrontendDepartment {
  return {
    id: dept.id,
    name: dept.name,
    code: dept.slug,                                    // Map slug to code for frontend
    slug: dept.slug,                                    // Keep original slug
    description: dept.description || `แผนก ${dept.name}`,
    color: mapColorThemeToTailwind(dept.color),
    icon: dept.icon || 'BUILDING',                      // Keep as string
    isActive: dept.isActive,
    parentId: dept.parentId,
    
    // Mock data for now (will be replaced with real stock/user data later)
    memberCount: Math.floor(Math.random() * 20) + 5,
    stockItems: Math.floor(Math.random() * 200) + 50,
    lowStock: Math.floor(Math.random() * 10),
    notifications: Math.floor(Math.random() * 5),
    manager: 'ไม่ระบุ',
    lastActivity: dept.updatedAt.toISOString(),
    category: getDepartmentCategory(dept.icon, dept.name),
    createdAt: dept.createdAt,
    updatedAt: dept.updatedAt,
  };
}

/**
 * ✅ Find department by slug in frontend (for navigation)
 */
export function findDepartmentBySlug(departments: FrontendDepartment[], deptSlug: string): FrontendDepartment | null {
  // Try exact slug match first
  let found = departments.find(dept => dept.slug.toLowerCase() === deptSlug.toLowerCase());
  
  // Fallback to code match
  if (!found) {
    found = departments.find(dept => dept.code.toLowerCase() === deptSlug.toLowerCase());
  }
  
  // Fallback to name includes (for flexibility)
  if (!found) {
    found = departments.find(dept => 
      dept.name.toLowerCase().includes(deptSlug.toLowerCase())
    );
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
 * ✅ Get department display info for specific seeded departments
 */
export function getDepartmentDisplayInfo(slug: string): { 
  thaiName: string; 
  shortCode: string; 
  category: string 
} {
  const departmentMap: Record<string, { thaiName: string; shortCode: string; category: string }> = {
    'MAIN_PHARM': { thaiName: 'คลังยาหลัก', shortCode: 'MAIN', category: 'main' },
    'ER': { thaiName: 'ห้องฉุกเฉิน', shortCode: 'ER', category: 'clinical' },
    'IPD': { thaiName: 'หอผู้ป่วยใน', shortCode: 'IPD', category: 'clinical' },
    'OPD': { thaiName: 'ผู้ป่วยนอก', shortCode: 'OPD', category: 'clinical' },
    'OR': { thaiName: 'ห้องผ่าตัด', shortCode: 'OR', category: 'clinical' },
    'ICU': { thaiName: 'หน่วยแรงดัน', shortCode: 'ICU', category: 'clinical' },
    'LAB': { thaiName: 'ห้องปฏิบัติการ', shortCode: 'LAB', category: 'support' },
    'DISPENSE': { thaiName: 'ห้องจ่ายยา', shortCode: 'DISP', category: 'main' },
    'STORAGE': { thaiName: 'คลังสินค้า', shortCode: 'STOR', category: 'support' },
    'CONSULT': { thaiName: 'ห้องปรึกษา', shortCode: 'CONS', category: 'support' },
    'EXAM': { thaiName: 'ห้องตรวจ', shortCode: 'EXAM', category: 'clinical' },
    'PHARMACY': { thaiName: 'ห้องยา', shortCode: 'PHARM', category: 'support' },
  };

  return departmentMap[slug.toUpperCase()] || { 
    thaiName: slug, 
    shortCode: slug.substring(0, 4).toUpperCase(), 
    category: 'support' 
  };
}