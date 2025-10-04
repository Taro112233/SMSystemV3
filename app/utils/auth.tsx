// app/utils/auth.tsx - SIMPLIFIED AUTH CONTEXT (FIXED LINT ERRORS)
// InvenStock - Username-based Authentication Hooks

'use client';

import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { 
  User,
  Organization,
  OrganizationUser,
  LoginRequest,
  RegisterRequest,
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  joinByCode,
  storeUserData,
  getStoredUserData,
  clearStoredUserData,
  parseAuthError,
  isAuthError,
  hasPermission,
  isMinimumRole
} from './auth-client';

// ===== AUTHENTICATION CONTEXT =====

interface AuthContextType {
  user: User | null;
  currentOrganization: Organization | null;
  organizations: OrganizationUser[];
  userRole: 'MEMBER' | 'ADMIN' | 'OWNER' | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<{ requiresApproval: boolean }>;
  logout: () => Promise<void>;
  switchOrganization: (orgSlug: string) => Promise<void>;
  joinOrganization: (inviteCode: string) => Promise<{
    success: boolean;
    organization?: Organization;
    message?: string;
  }>;
  refreshUser: (orgSlug?: string) => Promise<void>;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
  hasMinimumRole: (minimumRole: 'MEMBER' | 'ADMIN' | 'OWNER') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===== AUTHENTICATION PROVIDER =====

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationUser[]>([]);
  const [userRole, setUserRole] = useState<'MEMBER' | 'ADMIN' | 'OWNER' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Permission checking helpers
  const checkPermission = useCallback((permission: string): boolean => {
    if (!userRole) return false;
    return hasPermission(userRole, permission);
  }, [userRole]);

  const checkMinimumRole = useCallback((minimumRole: 'MEMBER' | 'ADMIN' | 'OWNER'): boolean => {
    if (!userRole) return false;
    return isMinimumRole(userRole, minimumRole);
  }, [userRole]);

  // ✅ Refresh user data with optional organization context
  const refreshUser = useCallback(async (orgSlug?: string) => {
    try {
      setLoading(true);
      const data = await getCurrentUser(orgSlug);
      
      setUser(data.user);
      setOrganizations(data.organizations);
      
      if (data.currentOrganization) {
        setCurrentOrganization(data.currentOrganization);
        // Find user's role in current organization
        const currentOrgUser = data.organizations.find(
          org => org.organizationId === data.currentOrganization?.id
        );
        if (currentOrgUser) {
          setUserRole(currentOrgUser.role);
        }
      } else {
        setCurrentOrganization(null);
        setUserRole(null);
      }
      
      storeUserData(data.user);
      
      console.log('User data refreshed');
    } catch (err) {
      if (isAuthError(err)) {
        // Clear user data if authentication failed
        setUser(null);
        setCurrentOrganization(null);
        setOrganizations([]);
        setUserRole(null);
        clearStoredUserData();
      }
      console.error('Failed to refresh user:', parseAuthError(err));
    } finally {
      setLoading(false);
    }
  }, []); // ✅ FIXED: No dependencies needed, all state setters are stable

  // ✅ Login function - no organization context in JWT
  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      setError(null);

      const response = await loginUser(credentials);
      
      setUser(response.user);
      setOrganizations(response.organizations || []);
      
      // No default organization - user will choose
      setCurrentOrganization(null);
      setUserRole(null);
      
      storeUserData(response.user);
      
      console.log('Login successful:', response.user.username);
    } catch (err) {
      const errorMessage = parseAuthError(err);
      setError(errorMessage);
      console.error('Login failed:', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (userData: RegisterRequest) => {
    try {
      setLoading(true);
      setError(null);

      const response = await registerUser(userData);
      
      console.log('Registration successful:', response.user.username);
      
      // If no approval required, log them in
      if (!response.requiresApproval && response.token) {
        setUser(response.user);
        storeUserData(response.user);
        
        // If organization created, set as current
        if (response.organization) {
          setCurrentOrganization(response.organization);
          setUserRole('OWNER');
          setOrganizations([{
            id: 'temp',
            organizationId: response.organization.id,
            userId: response.user.id,
            role: 'OWNER',
            isOwner: true,
            joinedAt: new Date(),
            isActive: true,
            organization: response.organization
          }]);
        }
      }
      
      return { requiresApproval: response.requiresApproval };
    } catch (err) {
      const errorMessage = parseAuthError(err);
      setError(errorMessage);
      console.error('Registration failed:', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await logoutUser();
      
      setUser(null);
      setCurrentOrganization(null);
      setOrganizations([]);
      setUserRole(null);
      clearStoredUserData();
      
      console.log('Logout successful');
    } catch (err) {
      console.error('Logout failed:', parseAuthError(err));
      // Clear local state even if logout fails
      setUser(null);
      setCurrentOrganization(null);
      setOrganizations([]);
      setUserRole(null);
      clearStoredUserData();
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Switch organization by slug
  const switchOrganization = useCallback(async (orgSlug: string) => {
    try {
      setLoading(true);
      setError(null);

      // Get user data with organization context
      const data = await getCurrentUser(orgSlug);
      
      setUser(data.user);
      setOrganizations(data.organizations);
      
      if (data.currentOrganization) {
        setCurrentOrganization(data.currentOrganization);
        
        // Find user's role in current organization
        const currentOrgUser = data.organizations.find(
          org => org.organizationId === data.currentOrganization?.id
        );
        if (currentOrgUser) {
          setUserRole(currentOrgUser.role);
        }
      }
      
      console.log('Switched to organization:', orgSlug);
    } catch (err) {
      const errorMessage = parseAuthError(err);
      setError(errorMessage);
      console.error('Failed to switch organization:', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Join organization by code
  const joinOrganization = useCallback(async (inviteCode: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await joinByCode(inviteCode);
      
      // Refresh user data to get updated organizations list
      await refreshUser();
      
      console.log('Successfully joined organization:', response.organization?.name);
      return response;
    } catch (err) {
      const errorMessage = parseAuthError(err);
      setError(errorMessage);
      console.error('Failed to join organization:', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshUser]); // ✅ FIXED: Include refreshUser dependency

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        
        // Check cookie first
        const hasCookie = typeof document !== 'undefined' && 
                         document.cookie.includes('auth-token=');
        
        if (!hasCookie) {
          console.log('No auth cookie found, skipping auth check');
          setLoading(false);
          return;
        }
        
        // Has cookie, verify with server
        console.log('Auth cookie found, verifying with server...');
        
        // Load stored data first for immediate UI update
        const storedUser = getStoredUserData();
        if (storedUser) {
          setUser(storedUser);
        }
        
        // Get fresh data from server (no org context initially)
        await refreshUser();
        
      } catch (err) {
        console.error('Auth initialization failed:', parseAuthError(err));
        setLoading(false);
      }
    };

    initAuth();
  }, [refreshUser]);

  const value: AuthContextType = {
    user,
    currentOrganization,
    organizations,
    userRole,
    loading,
    error,
    login,
    register,
    logout,
    switchOrganization,
    joinOrganization,
    refreshUser,
    clearError,
    hasPermission: checkPermission,
    hasMinimumRole: checkMinimumRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ===== AUTHENTICATION HOOK =====

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// ===== CONVENIENCE HOOKS =====

export function useIsAuthenticated(): boolean {
  const { user, loading } = useAuth();
  return !loading && user !== null;
}

export function useCurrentUser(): User | null {
  const { user } = useAuth();
  return user;
}

export function useCurrentOrganization(): Organization | null {
  const { currentOrganization } = useAuth();
  return currentOrganization;
}

export function useUserRole(): 'MEMBER' | 'ADMIN' | 'OWNER' | null {
  const { userRole } = useAuth();
  return userRole;
}

export function useOrganizations(): OrganizationUser[] {
  const { organizations } = useAuth();
  return organizations;
}

export function useHasPermission(permission: string): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
}

export function useIsAdmin(): boolean {
  const { userRole } = useAuth();
  return userRole === 'ADMIN' || userRole === 'OWNER';
}

export function useIsOwner(): boolean {
  const { userRole } = useAuth();
  return userRole === 'OWNER';
}