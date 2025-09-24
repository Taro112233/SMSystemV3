// app/utils/auth-client.ts - CLEANED VERSION (JOIN BY CODE ONLY)
// InvenStock - Username-based Authentication Client (No Invitation System)

export interface User {
  id: string;
  email?: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  status: string;
  isActive: boolean;
  emailVerified: boolean;
  avatar?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  status: string;
  timezone: string;
  currency?: string;
  
  // Join by Code fields
  inviteCode?: string;
  inviteEnabled?: boolean;
}

export interface OrganizationUser {
  id: string;
  organizationId: string;
  userId: string;
  role: 'MEMBER' | 'ADMIN' | 'OWNER';  // Simple role enum
  isOwner: boolean;
  joinedAt: Date;
  isActive: boolean;
  organization: Organization;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
  organizations?: OrganizationUser[];
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
  message: string;
  user: User;
  token?: string;
  organization?: Organization;
  requiresApproval: boolean;
}

export interface JoinByCodeRequest {
  inviteCode: string;
}

export interface JoinByCodeResponse {
  success: boolean;
  organization: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    memberCount: number;
    userRole: 'MEMBER';
    isOwner: boolean;
    joinedAt: Date;
    isActive: boolean;
  };
  message?: string;
  nextSteps?: string[];
}

export interface AuthError {
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

// ===== API CLIENT FUNCTIONS =====

export async function loginUser(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  return data;
}

export async function registerUser(userData: RegisterRequest): Promise<RegisterResponse> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Registration failed');
  }

  return data;
}

export async function logoutUser(): Promise<void> {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Logout failed');
  }
}

export async function getCurrentUser(): Promise<{
  user: User;
  organizations: OrganizationUser[];
  currentOrganization?: Organization;
}> {
  const response = await fetch('/api/auth/me', {
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to get user info');
  }

  return data.data;
}

export async function switchOrganization(organizationId: string): Promise<{
  organization: Organization;
  role: 'MEMBER' | 'ADMIN' | 'OWNER';
}> {
  const response = await fetch('/api/auth/switch-organization', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ organizationId }),
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to switch organization');
  }

  return data;
}

// ===== JOIN BY CODE FUNCTIONS =====

export async function joinByCode(inviteCode: string): Promise<JoinByCodeResponse> {
  const response = await fetch('/api/organizations/join-by-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inviteCode }),
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to join organization');
  }

  return data;
}

export async function checkJoinCodeValidity(inviteCode: string): Promise<{
  valid: boolean;
  organization?: {
    name: string;
    description?: string;
    memberCount: number;
  };
}> {
  const response = await fetch(`/api/organizations/join-by-code?code=${encodeURIComponent(inviteCode)}`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    return { valid: false };
  }

  return {
    valid: data.valid,
    organization: data.organization
  };
}

// ===== ORGANIZATION MANAGEMENT (FOR ADMIN/OWNER) =====

export async function generateJoinCode(organizationId: string): Promise<{
  inviteCode: string;
  inviteEnabled: boolean;
}> {
  const response = await fetch(`/api/organizations/${organizationId}/join-code`, {
    method: 'POST',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to generate join code');
  }

  return data;
}

export async function disableJoinCode(organizationId: string): Promise<void> {
  const response = await fetch(`/api/organizations/${organizationId}/join-code`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to disable join code');
  }
}

export async function getJoinCodeInfo(organizationId: string): Promise<{
  inviteCode: string | null;
  inviteEnabled: boolean;
  memberCount: number;
}> {
  const response = await fetch(`/api/organizations/${organizationId}/join-code`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to get join code info');
  }

  return data;
}

// ===== CLIENT-SIDE STORAGE HELPERS =====

export function storeUserData(user: User): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('user_data', JSON.stringify(user));
    } catch (error) {
      console.warn('Failed to store user data:', error);
    }
  }
}

export function storeOrganizationData(organization: Organization): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('current_organization', JSON.stringify(organization));
    } catch (error) {
      console.warn('Failed to store organization data:', error);
    }
  }
}

export function getStoredUserData(): User | null {
  if (typeof window !== 'undefined') {
    try {
      const userData = localStorage.getItem('user_data');
      if (!userData || userData === 'undefined' || userData === 'null') {
        return null;
      }
      return JSON.parse(userData);
    } catch (error) {
      console.warn('Failed to get stored user data:', error);
      return null;
    }
  }
  return null;
}

export function getStoredOrganizationData(): Organization | null {
  if (typeof window !== 'undefined') {
    try {
      const orgData = localStorage.getItem('current_organization');
      if (!orgData || orgData === 'undefined' || orgData === 'null') {
        return null;
      }
      return JSON.parse(orgData);
    } catch (error) {
      console.warn('Failed to get stored organization data:', error);
      return null;
    }
  }
  return null;
}

export function clearStoredUserData(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('user_data');
      localStorage.removeItem('current_organization');
      localStorage.removeItem('user_organizations');
    } catch (error) {
      console.warn('Failed to clear stored data:', error);
    }
  }
}

// ===== VALIDATION HELPERS =====

export function validateLoginData(data: Partial<LoginRequest>): string[] {
  const errors: string[] = [];

  if (!data.username?.trim()) {
    errors.push('Username is required');
  } else if (data.username.length < 3) {
    errors.push('Username must be at least 3 characters');
  }

  if (!data.password) {
    errors.push('Password is required');
  }

  return errors;
}

export function validateRegisterData(data: Partial<RegisterRequest>): string[] {
  const errors: string[] = [];

  if (!data.username?.trim()) {
    errors.push('Username is required');
  } else if (data.username.length < 3) {
    errors.push('Username must be at least 3 characters');
  }

  if (!data.password) {
    errors.push('Password is required');
  } else if (data.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (!data.firstName?.trim()) {
    errors.push('First name is required');
  }

  if (!data.lastName?.trim()) {
    errors.push('Last name is required');
  }

  if (data.email?.trim()) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Invalid email format');
    }
  }

  return errors;
}

export function validateJoinCodeFormat(code: string): { valid: boolean; error?: string } {
  if (!code?.trim()) {
    return { valid: false, error: 'Join code is required' };
  }

  // Validate format: ORG-XXXXXX
  const codePattern = /^ORG-[A-Z0-9]{6}$/i;
  if (!codePattern.test(code.trim())) {
    return { valid: false, error: 'Invalid code format. Should be ORG-XXXXXX' };
  }

  return { valid: true };
}

// ===== ERROR HANDLING =====

export function parseAuthError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

export function isAuthError(error: unknown): boolean {
  const message = parseAuthError(error).toLowerCase();
  return message.includes('unauthorized') || 
         message.includes('not authenticated') ||
         message.includes('invalid token') ||
         message.includes('expired token');
}

// ===== UTILITY FUNCTIONS =====

export function formatUserName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}

export function getUserDisplayName(user: User): string {
  return user.fullName || formatUserName(user);
}

export function userNeedsApproval(user: User): boolean {
  return user.status === 'PENDING';
}

export function isUserActive(user: User): boolean {
  return user.status === 'ACTIVE' && user.isActive;
}

export function getUserInitials(user: User): string {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
}

// ===== SIMPLE ROLE HELPERS =====

export function hasPermission(
  userRole: 'MEMBER' | 'ADMIN' | 'OWNER',
  permission: string
): boolean {
  switch (permission) {
    // MEMBER permissions
    case 'stocks.read':
    case 'stocks.adjust':
    case 'products.read':
    case 'transfers.create':
    case 'transfers.receive':
      return ['MEMBER', 'ADMIN', 'OWNER'].includes(userRole);
    
    // ADMIN permissions
    case 'products.create':
    case 'products.update':
    case 'products.delete':
    case 'categories.create':
    case 'departments.create':
    case 'departments.update':
    case 'transfers.approve':
    case 'join_code.generate':         // ✅ Generate join codes
      return ['ADMIN', 'OWNER'].includes(userRole);
    
    // OWNER permissions
    case 'departments.delete':
    case 'organization.settings':
    case 'users.manage':
      return userRole === 'OWNER';
    
    default:
      return false;
  }
}

export function isMinimumRole(
  userRole: 'MEMBER' | 'ADMIN' | 'OWNER',
  minimumRole: 'MEMBER' | 'ADMIN' | 'OWNER'
): boolean {
  const roleHierarchy = {
    MEMBER: 1,
    ADMIN: 2,
    OWNER: 3
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[minimumRole];
}