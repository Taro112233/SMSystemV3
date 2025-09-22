// types/auth.d.ts - SIMPLIFIED 3-ROLE SYSTEM
// InvenStock - Authentication Type Definitions (Updated)

export interface User {
  id: string;
  email?: string;             // Optional ตรงกับ Schema
  username: string;           // Required ตรงกับ Schema
  firstName: string;
  lastName: string;
  phone?: string;
  status: UserStatus;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Computed fields (ไม่อยู่ใน Database)
  fullName?: string;          // firstName + lastName
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  email?: string;
  phone?: string;
  status: OrganizationStatus;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
  
  // ❌ REMOVED: allowDepartments, currency, logo, primaryColor, website, address
  // เหลือเฉพาะ fields ที่มีใน simplified schema
}

export interface OrganizationUser {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;     // Simple role assignment
  isOwner: boolean;
  joinedAt: Date;
  lastActiveAt?: Date;
  isActive: boolean;
  organization: Organization;
  user: User;
}

// Authentication Requests
export interface LoginRequest {
  username: string;           // Primary credential
  password: string;
  organizationId?: string;    // Optional context switching
}

export interface LoginResponse {
  success: boolean;
  user: User;
  token: string;
  organizations: OrganizationUser[];
  currentOrganization?: Organization;  // If organizationId provided
  message?: string;
}

export interface RegisterRequest {
  username: string;           // Required
  password: string;
  firstName: string;
  lastName: string;
  email?: string;             // Optional
  phone?: string;
  organizationName?: string;  // Create new org if provided
}

export interface RegisterResponse {
  success: boolean;
  user: User;
  token?: string;
  organization?: Organization;
  requiresApproval: boolean;
  message?: string;
}

// Multi-tenant Context - SIMPLIFIED
export interface AuthContextType {
  user: User | null;
  currentOrganization: Organization | null;
  organizations: OrganizationUser[];
  userRole: OrganizationRole | null;    // ✅ Organization role only
  loading: boolean;
  
  // Actions
  login: (data: LoginRequest) => Promise<LoginResponse>;
  register: (data: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  switchOrganization: (organizationId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  
  // Permission helpers
  hasPermission: (permission: string) => boolean;
  hasMinimumRole: (minimumRole: OrganizationRole) => boolean;
  
  // ❌ REMOVED: currentDepartment, departmentPermissions
}

// JWT Payload - Simplified
export interface JWTPayload {
  userId: string;
  username: string;
  email?: string;
  firstName: string;
  lastName: string;
  organizationId?: string;    // Current active organization
  role?: OrganizationRole;    // Simple role in active org
  iat?: number;
  exp?: number;
}

// Invitation Interface - Simplified
export interface UserInvitation {
  id: string;
  organizationId: string;
  inviterId: string;
  inviteeId?: string;
  inviteeEmail?: string;      // Optional
  inviteeUsername?: string;   // Optional
  role: OrganizationRole;     // ✅ Simple role assignment (organization level)
  message?: string;
  status: InvitationStatus;
  expiresAt: Date;
  respondedAt?: Date;
  response?: string;
  createdAt: Date;
  updatedAt: Date;
  organization: Organization;
  inviter: User;
  invitee?: User;
  
  // ❌ REMOVED: departmentIds, departmentRole - ไม่มี department access control แล้ว
}

// Department Interface - Simplified (Data Organization Only)
export interface Department {
  id: string;
  organizationId: string;
  parentId?: string;          // For hierarchical structure
  name: string;
  code: string;               // Short code (e.g., "ICU", "ER", "PHARMACY")
  description?: string;
  color?: ColorTheme;
  icon?: IconType;
  isActive: boolean;
  
  // Audit fields
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  organization: Organization;
  parent?: Department;
  children?: Department[];
  
  // ❌ REMOVED: requiresAccess, departmentUsers - no access control
}

// Simple 3-Role System
export enum OrganizationRole {
  MEMBER = 'MEMBER',  // ทำงานทั่วไป เบิก จ่าย แก้สต็อก ดูทุกแผนก
  ADMIN = 'ADMIN',    // Member + CRUD สินค้า/แผนก + เชิญผู้ใช้
  OWNER = 'OWNER'     // Admin + จัดการองค์กร + ตั้งค่าระบบ
}

// Enums ตรงกับ Prisma Schema
export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE'
}

export enum OrganizationStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  TRIAL = 'TRIAL'
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED'
}

export enum ColorTheme {
  BLUE = 'BLUE',
  GREEN = 'GREEN',
  RED = 'RED',
  YELLOW = 'YELLOW',
  PURPLE = 'PURPLE',
  PINK = 'PINK',
  INDIGO = 'INDIGO',
  TEAL = 'TEAL',
  ORANGE = 'ORANGE',
  GRAY = 'GRAY',
  SLATE = 'SLATE',
  EMERALD = 'EMERALD'
}

export enum IconType {
  BUILDING = 'BUILDING',
  HOSPITAL = 'HOSPITAL',
  PHARMACY = 'PHARMACY',
  WAREHOUSE = 'WAREHOUSE',
  LABORATORY = 'LABORATORY',
  PILL = 'PILL',
  BOTTLE = 'BOTTLE',
  SYRINGE = 'SYRINGE',
  BANDAGE = 'BANDAGE',
  STETHOSCOPE = 'STETHOSCOPE',
  CROWN = 'CROWN',
  SHIELD = 'SHIELD',
  PERSON = 'PERSON',
  EYE = 'EYE',
  GEAR = 'GEAR',
  BOX = 'BOX',
  FOLDER = 'FOLDER',
  TAG = 'TAG',
  STAR = 'STAR',
  HEART = 'HEART',
  CIRCLE = 'CIRCLE',
  SQUARE = 'SQUARE',
  TRIANGLE = 'TRIANGLE'
}