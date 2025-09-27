// hooks/use-org-access.ts - FIXED WITH DEBUG LOGS
// Organization access validation hook for frontend pages

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/utils/auth';

interface UseOrgAccessProps {
  orgSlug: string;
  redirectOnNoAccess?: boolean;
  requiredRole?: 'MEMBER' | 'ADMIN' | 'OWNER';
}

interface UseOrgAccessReturn {
  hasAccess: boolean | null;
  loading: boolean;
  error: string | null;
  userRole: 'MEMBER' | 'ADMIN' | 'OWNER' | null;
}

export function useOrgAccess({
  orgSlug,
  redirectOnNoAccess = true,
  requiredRole = 'MEMBER'
}: UseOrgAccessProps): UseOrgAccessReturn {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'MEMBER' | 'ADMIN' | 'OWNER' | null>(null);
  
  const { user, switchOrganization, currentOrganization, userRole: authUserRole, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkOrgAccess = async () => {
      try {
        console.log('🔍 useOrgAccess: Starting check for', orgSlug);
        console.log('🔍 Auth state:', { 
          user: !!user, 
          currentOrganization: currentOrganization?.slug, 
          authUserRole, 
          authLoading 
        });

        setLoading(true);
        setError(null);

        // Wait for auth to finish loading
        if (authLoading) {
          console.log('⏳ Auth still loading, waiting...');
          return;
        }

        // Check if user is authenticated
        if (!user) {
          console.log('❌ No user found, redirecting to login');
          setError('User not authenticated');
          setHasAccess(false);
          if (redirectOnNoAccess) {
            router.push('/login');
          }
          return;
        }

        console.log('✅ User found:', user.username);

        // Check if we're already in the right organization
        if (currentOrganization && currentOrganization.slug === orgSlug && authUserRole) {
          console.log('✅ Already in correct organization:', orgSlug, 'with role:', authUserRole);
          
          setUserRole(authUserRole);
          
          // Check role requirement
          const roleHierarchy = { MEMBER: 1, ADMIN: 2, OWNER: 3 };
          const hasRequiredRole = roleHierarchy[authUserRole] >= roleHierarchy[requiredRole];
          
          if (!hasRequiredRole) {
            console.log('❌ Insufficient role. Required:', requiredRole, 'Has:', authUserRole);
            setError(`Requires ${requiredRole} role or higher`);
            setHasAccess(false);
            if (redirectOnNoAccess) {
              router.push('/not-found');
            }
            return;
          }

          console.log('✅ Access granted for organization:', orgSlug);
          setHasAccess(true);
          return;
        }

        // Need to switch organization
        console.log('🔄 Switching to organization:', orgSlug);
        try {
          await switchOrganization(orgSlug);
          console.log('✅ Organization switch successful');
          
          // The useEffect will re-run after switchOrganization updates the auth state
          // So we don't need to do anything else here
          
        } catch (switchError) {
          console.error('❌ Failed to switch organization:', switchError);
          setError('Cannot access this organization');
          setHasAccess(false);
          if (redirectOnNoAccess) {
            router.push('/not-found');
          }
          return;
        }

      } catch (err) {
        console.error('❌ Organization access check failed:', err);
        setError('Failed to verify organization access');
        setHasAccess(false);
        if (redirectOnNoAccess) {
          router.push('/not-found');
        }
      } finally {
        setLoading(false);
      }
    };

    if (orgSlug) {
      checkOrgAccess();
    }
  }, [user, orgSlug, currentOrganization, authUserRole, authLoading, switchOrganization, requiredRole, redirectOnNoAccess, router]);

  return {
    hasAccess,
    loading,
    error,
    userRole
  };
}