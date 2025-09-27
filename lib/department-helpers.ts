// lib/department-helpers.ts - SIMPLIFIED STRING-BASED APPROACH
// Helper functions for mapping department data from database to frontend

import { 
  Building, Hospital, Warehouse, TestTube, Pill,
  Activity, Stethoscope, Users, Package, Shield,
  Circle, Square, Triangle, Star, Heart, Crown,
  Eye, Settings, Folder, Tag, Box
} from 'lucide-react';

/**
 * ✅ SIMPLIFIED: Map IconType enum to icon string identifier
 * Returns string instead of React component to avoid serialization issues
 */
export function mapIconTypeToString(iconType: string | null | undefined): string {
  if (!iconType) {
    return 'BUILDING';
  }
  
  const validIcons = [
    'BUILDING', 'HOSPITAL', 'PHARMACY', 'WAREHOUSE', 'LABORATORY',
    'PILL', 'BOTTLE', 'SYRINGE', 'BANDAGE', 'STETHOSCOPE',
    'CROWN', 'SHIELD', 'PERSON', 'EYE', 'GEAR',
    'BOX', 'FOLDER', 'TAG', 'STAR', 'HEART', 'CIRCLE', 'SQUARE', 'TRIANGLE'
  ];

  const normalizedIcon = iconType.toUpperCase();
  return validIcons.includes(normalizedIcon) ? normalizedIcon : 'BUILDING';
}

/**
 * ✅ Get React component from icon string (for frontend use)
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
 * ✅ Map ColorTheme enum with validation
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
 * Get department category based on icon and name
 */
export function getDepartmentCategory(iconType: string | null | undefined, name: string): string {
  const clinicalKeywords = ['icu', 'opd', 'ipd', 'er', 'surgery', 'ward', 'clinic'];
  const supportKeywords = ['lab', 'pharmacy', 'admin', 'finance', 'hr'];
  
  const nameLC = name.toLowerCase();
  
  if (clinicalKeywords.some(keyword => nameLC.includes(keyword))) {
    return 'clinical';
  }
  
  if (supportKeywords.some(keyword => nameLC.includes(keyword))) {
    return 'support';
  }
  
  return 'main';
}

/**
 * Database Department interface
 */
export interface DatabaseDepartment {
  id: string;
  name: string;
  code: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  parentId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

/**
 * ✅ SIMPLIFIED: Frontend Department interface with string-based icon
 */
export interface FrontendDepartment {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  icon: string;               // ✅ String instead of React component
  isActive: boolean;
  memberCount: number;
  stockItems: number;
  lowStock: number;
  notifications: number;
  manager: string;
  lastActivity: string;
  category: string;
}

/**
 * ✅ SIMPLIFIED: Transform department data using string-based approach
 */
export function transformDepartmentData(dept: DatabaseDepartment): FrontendDepartment {
  return {
    id: dept.id,
    name: dept.name,
    code: dept.code,
    description: dept.description || `แผนก ${dept.name}`,
    color: mapColorThemeToTailwind(dept.color),
    icon: mapIconTypeToString(dept.icon),        // ✅ Returns string
    isActive: dept.isActive,
    memberCount: 0,
    stockItems: 0,
    lowStock: 0,
    notifications: 0,
    manager: 'ไม่ระบุ',
    lastActivity: dept.updatedAt.toISOString(),
    category: getDepartmentCategory(dept.icon, dept.name)
  };
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