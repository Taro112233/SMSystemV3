// app/utils/auth-client.ts - SIMPLIFIED 3-ROLE SYSTEM
// InvenStock - Username-based Authentication Client

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
  currency: string;
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
  role: 'MEMBER' | 'ADMIN' | 'OWNER';  // Simple role instead of permissions array
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
    case 'users.invite':
    case 'transfers.approve':
      return ['ADMIN', 'OWNER'].includes(userRole);
    
    // OWNER permissions
    case 'departments.create':
    case 'departments.update':
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