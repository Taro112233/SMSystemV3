// app/utils/auth-client.ts - SIMPLIFIED API CLIENT
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
  status: string;
  timezone: string;
  
  // Join by Code fields
  inviteCode?: string;
  inviteEnabled?: boolean;
  
  // Stats
  memberCount?: number;
  departmentCount?: number;
}

export interface OrganizationUser {
  id: string;
  organizationId: string;
  userId: string;
  role: 'MEMBER' | 'ADMIN' | 'OWNER';
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

/**
 * ✅ Get current user with dynamic organization context
 */
export async function getCurrentUser(orgSlug?: string): Promise<{
  user: User;
  organizations: OrganizationUser[];
  currentOrganization?: Organization;
}> {
  const url = new URL('/api/auth/me', window.location.origin);
  if (orgSlug) {
    url.searchParams.set('orgSlug', orgSlug);
  }

  const response = await fetch(url.toString(), {
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to get user info');
  }

  return data.data;
}

// ===== JOIN BY CODE FUNCTIONS =====

export async function joinByCode(inviteCode: string) {
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

// ===== CLIENT-SIDE STORAGE =====

export function storeUserData(user: User): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('user_data', JSON.stringify(user));
    } catch (error) {
      console.warn('Failed to store user data:', error);
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

export function clearStoredUserData(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('user_data');
    } catch (error) {
      console.warn('Failed to clear stored data:', error);
    }
  }
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
    case 'join_code.generate':
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