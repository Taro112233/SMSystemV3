// types/auth.d.ts - CLEANED VERSION (NO INVITATION SYSTEM)
// InvenStock - Authentication Type Definitions (Join by Code Only)

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
  avatar?: string;            // For UI display
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
  
  // Join by Code fields
  inviteCode?: string;        // Organization join code
  inviteEnabled?: boolean;    // Allow joining via code
  
  // Stats for API response
  memberCount?: number;       // Count of active members
  departmentCount?: number;   // Count of active departments
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

// ===== API RESPONSE INTERFACES =====
export interface CompleteUserData {
  user: {
    id: string;
    username: string;
    email: string | null;
    firstName: string;
    lastName: string;
    fullName: string;
    phone: string | null;
    status: string;
    isActive: boolean;
    emailVerified: boolean;
    lastLogin: Date | null;
    avatar: string;
    createdAt: Date;
    updatedAt: Date;
  };
  currentOrganization: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    status: string;
    timezone: string;
    memberCount: number;
    departmentCount: number;
    inviteCode?: string | null;      // Only for ADMIN/OWNER
    inviteEnabled?: boolean;         // Only for ADMIN/OWNER
  } | null;
  organizations: Array<{
    id: string;
    organizationId: string;
    role: string;
    isOwner: boolean;
    joinedAt: Date;
    organization: {
      id: string;
      name: string;
      slug: string;
      memberCount: number;
      departmentCount: number;
    };
  }>;
  permissions: {
    currentRole: string | null;
    canManageOrganization: boolean;
    canManageDepartments: boolean;
    canCreateProducts: boolean;
    canGenerateJoinCode: boolean;     // ✅ Join code permission
    organizationPermissions: string[];
  };
  session: {
    isTokenExpiringSoon: boolean;
    timezone: string;
    language: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp?: string;
  message?: string;
}

// ===== AUTHENTICATION INTERFACES =====
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
  currentOrganization?: Organization;
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

// ===== JOIN BY CODE INTERFACES =====
export interface JoinByCodeRequest {
  inviteCode: string;         // Organization join code (ORG-XXXXXX format)
}

export interface JoinByCodeResponse {
  success: boolean;
  organization: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    memberCount: number;
    userRole: 'MEMBER';       // New joiners always start as MEMBER
    isOwner: boolean;         // Always false for join by code
    joinedAt: Date;
    isActive: boolean;
  };
  message?: string;
  nextSteps?: string[];       // Guidance for new members
}

export interface GenerateJoinCodeResponse {
  success: boolean;
  inviteCode: string;
  inviteEnabled: boolean;
  memberCount: number;
}

// ===== CONTEXT AND HOOKS =====
export interface AuthContextType {
  user: User | null;
  currentOrganization: Organization | null;
  organizations: OrganizationUser[];
  userRole: OrganizationRole | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<{ requiresApproval: boolean }>;
  logout: () => Promise<void>;
  switchOrganization: (organizationId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  
  // Permission helpers
  hasPermission: (permission: string) => boolean;
  hasMinimumRole: (minimumRole: OrganizationRole) => boolean;
  
  // Join by code
  joinByCode: (code: string) => Promise<JoinByCodeResponse>;
  
  // Session info
  isTokenExpiringSoon?: boolean;
}

// ===== JWT INTERFACES =====
export interface JWTPayload {
  userId: string;
  email?: string;
  username?: string;
  firstName: string;          // Required field
  lastName: string;           // Required field
  organizationId?: string;
  role?: OrganizationRole;
  iat?: number;
  exp?: number;
}

export interface JWTUser {
  userId: string;
  email: string;
  username?: string;
  firstName: string;          // Required field
  lastName: string;           // Required field
  organizationId?: string;
  role?: OrganizationRole;
  iat?: number;
  exp?: number;
}

// ===== DEPARTMENT INTERFACE (SIMPLIFIED) =====
export interface Department {
  id: string;
  organizationId: string;
  parentId?: string;
  name: string;
  code: string;
  description?: string;
  color?: ColorTheme;
  icon?: IconType;
  isActive: boolean;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  organization: Organization;
  parent?: Department;
  children?: Department[];
}

// ===== ENUMS =====
export enum OrganizationRole {
  MEMBER = 'MEMBER',  // Can access all departments, manage stocks
  ADMIN = 'ADMIN',    // MEMBER + manage products/departments + generate join codes
  OWNER = 'OWNER'     // ADMIN + organization settings + manage users
}

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

// ===== ERROR TYPES =====
export interface ValidationError {
  field: string;
  message: string;
}

export interface AuthError {
  code: string;
  message: string;
  details?: ValidationError[];
}

// ===== HOOK RETURN TYPES =====
export interface UseAuthReturn extends AuthContextType {}

export interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseOrganizationReturn {
  organization: Organization | null;
  organizations: OrganizationUser[];
  loading: boolean;
  error: string | null;
  switchOrganization: (orgId: string) => Promise<void>;
  joinByCode: (code: string) => Promise<void>;
}