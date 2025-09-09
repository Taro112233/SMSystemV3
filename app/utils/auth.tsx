// app/utils/auth.tsx - SIMPLIFIED 3-ROLE SYSTEM
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
  switchOrganization,
  storeUserData,
  storeOrganizationData,
  getStoredUserData,
  getStoredOrganizationData,
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
  userRole: 'MEMBER' | 'ADMIN' | 'OWNER' | null;  // Current role in organization
  loading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<{ requiresApproval: boolean }>;
  logout: () => Promise<void>;
  switchOrg: (organizationId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
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

  // Login function with multi-tenant support
  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      setError(null);

      const response = await loginUser(credentials);
      
      setUser(response.user);
      setOrganizations(response.organizations || []);
      
      // Set default organization and role (first one or none)
      const defaultOrgUser = response.organizations?.[0];
      if (defaultOrgUser) {
        setCurrentOrganization(defaultOrgUser.organization);
        setUserRole(defaultOrgUser.role);
        storeOrganizationData(defaultOrgUser.organization);
      }
      
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
        
        if (response.organization) {
          setCurrentOrganization(response.organization);
          setUserRole('OWNER'); // Creator is automatically owner
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
          storeOrganizationData(response.organization);
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
      // Even if logout fails, clear local state
      setUser(null);
      setCurrentOrganization(null);
      setOrganizations([]);
      setUserRole(null);
      clearStoredUserData();
    } finally {
      setLoading(false);
    }
  }, []);

  // Switch organization
  const switchOrg = useCallback(async (organizationId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await switchOrganization(organizationId);
      
      setCurrentOrganization(response.organization);
      setUserRole(response.role);
      storeOrganizationData(response.organization);
      
      console.log('Switched to organization:', response.organization.name);
    } catch (err) {
      const errorMessage = parseAuthError(err);
      setError(errorMessage);
      console.error('Failed to switch organization:', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCurrentUser();
      
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
        storeOrganizationData(data.currentOrganization);
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
  }, []);

  // Initialize authentication state - MINIMAL FIX
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
        const storedOrg = getStoredOrganizationData();
        
        if (storedUser) {
          setUser(storedUser);
        }
        if (storedOrg) {
          setCurrentOrganization(storedOrg);
        }
        
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
    switchOrg,
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

// ===== AUTHENTICATION STATUS HOOKS =====

export function useIsAuthenticated(): boolean {
  const { user, loading } = useAuth();
  return !loading && user !== null;
}

export function useIsLoading(): boolean {
  const { loading } = useAuth();
  return loading;
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

export function useAuthError(): string | null {
  const { error } = useAuth();
  return error;
}

// ===== SIMPLIFIED PERMISSION HOOKS =====

export function useHasPermission(permission: string): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
}

export function useHasMinimumRole(minimumRole: 'MEMBER' | 'ADMIN' | 'OWNER'): boolean {
  const { hasMinimumRole } = useAuth();
  return hasMinimumRole(minimumRole);
}

export function useIsAdmin(): boolean {
  const { userRole } = useAuth();
  return userRole === 'ADMIN' || userRole === 'OWNER';
}

export function useIsOwner(): boolean {
  const { userRole } = useAuth();
  return userRole === 'OWNER';
}

// ===== MULTI-TENANT HOOKS =====

export function useHasOrganizationAccess(): boolean {
  const { user, currentOrganization, organizations } = useAuth();
  
  if (!user || !currentOrganization) return false;
  
  return organizations.some(org => 
    org.organizationId === currentOrganization.id && org.isActive
  );
}

export function useIsOrganizationOwner(): boolean {
  const { currentOrganization, organizations } = useAuth();
  
  if (!currentOrganization) return false;
  
  const userOrg = organizations.find(org => 
    org.organizationId === currentOrganization.id
  );
  
  return userOrg?.role === 'OWNER' || false;
}

export function useAvailableOrganizations(): OrganizationUser[] {
  const { organizations } = useAuth();
  return organizations.filter(org => org.isActive);
}

// ===== ROUTE PROTECTION HOOKS =====

export function useRequireAuth(): {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
} {
  const { user, loading } = useAuth();
  const isAuthenticated = !loading && user !== null;

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login';
    }
  }, [loading, user]);

  return {
    isAuthenticated,
    loading,
    user,
  };
}

export function useRequireOrganization(): {
  hasOrganization: boolean;
  loading: boolean;
  organization: Organization | null;
} {
  const { currentOrganization, loading } = useAuth();
  const hasOrganization = !loading && currentOrganization !== null;

  useEffect(() => {
    if (!loading && !currentOrganization) {
      window.location.href = '/select-organization';
    }
  }, [loading, currentOrganization]);

  return {
    hasOrganization,
    loading,
    organization: currentOrganization,
  };
}

export function useRequireRole(minimumRole: 'MEMBER' | 'ADMIN' | 'OWNER'): {
  hasRole: boolean;
  loading: boolean;
  userRole: 'MEMBER' | 'ADMIN' | 'OWNER' | null;
} {
  const { userRole, loading, hasMinimumRole } = useAuth();
  const hasRole = !loading && hasMinimumRole(minimumRole);

  useEffect(() => {
    if (!loading && !hasRole) {
      window.location.href = '/unauthorized';
    }
  }, [loading, hasRole]);

  return {
    hasRole,
    loading,
    userRole,
  };
}

export function useRedirectIfAuthenticated(redirectTo: string = '/dashboard'): void {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      window.location.href = redirectTo;
    }
  }, [loading, user, redirectTo]);
}

// ===== UTILITY HOOKS =====

export function useAuthAction() {
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const executeAuthAction = useCallback(async (action: () => Promise<any>) => {
    try {
      setActionLoading(true);
      setActionError(null);
      return await action();
    } catch (err) {
      setActionError(parseAuthError(err));
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const clearActionError = useCallback(() => {
    setActionError(null);
  }, []);

  return {
    loading: actionLoading,
    error: actionError,
    executeAction: executeAuthAction,
    clearError: clearActionError,
  };
}

// ===== FORM HOOKS =====

export function useLoginForm() {
  const [credentials, setCredentials] = useState<LoginRequest>({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  
  const { login } = useAuth();
  const { loading, executeAction } = useAuthAction();

  const updateCredentials = useCallback((updates: Partial<LoginRequest>) => {
    setCredentials(prev => ({ ...prev, ...updates }));
    setErrors([]);
  }, []);

  const handleLogin = useCallback(async () => {
    await executeAction(() => login(credentials));
  }, [executeAction, login, credentials]);

  return {
    credentials,
    updateCredentials,
    errors,
    loading,
    handleLogin,
  };
}

export function useRegisterForm() {
  const [userData, setUserData] = useState<RegisterRequest>({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organizationName: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  
  const { register } = useAuth();
  const { loading, executeAction } = useAuthAction();

  const updateUserData = useCallback((updates: Partial<RegisterRequest>) => {
    setUserData(prev => ({ ...prev, ...updates }));
    setErrors([]);
  }, []);

  const handleRegister = useCallback(async () => {
    return await executeAction(async () => {
      const result = await register(userData);
      return result;
    });
  }, [executeAction, register, userData]);

  return {
    userData,
    updateUserData,
    errors,
    loading,
    handleRegister,
  };
}

// ===== ORGANIZATION SWITCHING HOOK =====

export function useOrganizationSwitcher() {
  const { switchOrg, organizations, currentOrganization } = useAuth();
  const { loading, executeAction, error } = useAuthAction();

  const handleSwitch = useCallback(async (organizationId: string) => {
    if (currentOrganization?.id === organizationId) {
      return; // Already in this organization
    }

    await executeAction(() => switchOrg(organizationId));
  }, [executeAction, switchOrg, currentOrganization]);

  return {
    organizations: organizations.filter(org => org.isActive),
    currentOrganization,
    switchToOrganization: handleSwitch,
    loading,
    error,
  };
}

// ===== AUTHENTICATION GUARDS =====

interface WithAuthProps {
  fallback?: React.ComponentType;
  requireOrganization?: boolean;
  minimumRole?: 'MEMBER' | 'ADMIN' | 'OWNER';
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthProps = {}
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, loading } = useRequireAuth();
    const { hasOrganization, loading: orgLoading } = options.requireOrganization 
      ? useRequireOrganization() 
      : { hasOrganization: true, loading: false };
    const { hasRole, loading: roleLoading } = options.minimumRole
      ? useRequireRole(options.minimumRole)
      : { hasRole: true, loading: false };

    const isLoading = loading || orgLoading || roleLoading;
    const hasAccess = isAuthenticated && hasOrganization && hasRole;

    if (isLoading) {
      return options.fallback ? React.createElement(options.fallback) : React.createElement('div', null, 'Loading...');
    }

    if (!hasAccess) {
      return options.fallback ? React.createElement(options.fallback) : null;
    }

    return React.createElement(Component, props);
  };
}

// ===== UTILITY FUNCTIONS =====

export function checkIsAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return getStoredUserData() !== null;
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  return getStoredUserData();
}

export function getStoredOrganization(): Organization | null {
  if (typeof window === 'undefined') return null;
  return getStoredOrganizationData();
}