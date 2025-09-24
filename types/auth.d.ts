// types/auth.d.ts - SIMPLIFIED TYPES (NO ORGANIZATION IN JWT)
// InvenStock - Authentication Type Definitions

export interface User {
  id: string;
  email?: string;             // Optional
  username: string;           // Primary credential
  firstName: string;
  lastName: string;
  phone?: string;
  status: UserStatus;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Computed fields
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
  inviteCode?: string;
  inviteEnabled?: boolean;
  
  // Stats for API response
  memberCount?: number;
  departmentCount?: number;
}

export interface OrganizationUser {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  isOwner: boolean;
  joinedAt: Date;
  lastActiveAt?: Date;
  isActive: boolean;
  organization: Organization;
  user: User;
}

// ===== AUTHENTICATION INTERFACES =====
export interface LoginRequest {
  username: string;           // Primary credential
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  token: string;
  organizations: OrganizationUser[];
  message?: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  organizationName?: string;
}

export interface RegisterResponse {
  success: boolean;
  user: User;
  token?: string;
  organization?: Organization;
  requiresApproval: boolean;
  message?: string;
}

// ===== JWT INTERFACES (SIMPLIFIED) =====
export interface JWTPayload {
  userId: string;
  email?: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  iat?: number;
  exp?: number;
  // ❌ REMOVED: organizationId, role (checked dynamically)
}

export interface JWTUser {
  userId: string;
  email?: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  iat?: number;
  exp?: number;
  // ❌ REMOVED: organizationId, role (checked dynamically)
}

// ===== CONTEXT INTERFACES =====
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
  switchOrganization: (orgSlug: string) => Promise<void>;
  refreshUser: (orgSlug?: string) => Promise<void>;
  clearError: () => void;
  
  // Permission helpers
  hasPermission: (permission: string) => boolean;
  hasMinimumRole: (minimumRole: OrganizationRole) => boolean;
  
  // Join by code
  joinOrganization: (code: string) => Promise<any>;
}

// ===== ENUMS =====
export enum OrganizationRole {
  MEMBER = 'MEMBER',  // Basic access to all departments
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

// ===== API RESPONSE INTERFACES =====
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp?: string;
  message?: string;
}

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
    canGenerateJoinCode: boolean;
    organizationPermissions: string[];
  };
  session: {
    isTokenExpiringSoon: boolean;
    timezone: string;
    language: string;
  };
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