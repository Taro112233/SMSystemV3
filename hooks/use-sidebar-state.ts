// hooks/use-sidebar-state.ts
// Sidebar State Management Hook with localStorage persistence
// ============================================

import { useState, useEffect, useCallback } from 'react';

const SIDEBAR_STORAGE_KEY = 'invenstock_sidebar_collapsed';
const MOBILE_BREAKPOINT = 768;

interface SidebarState {
  collapsed: boolean;
  lastUpdated: number;
  deviceType: 'mobile' | 'desktop';
}

interface UseSidebarStateReturn {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  isLoading: boolean;
  isMobile: boolean;
}

/**
 * Smart sidebar state management with localStorage persistence
 * Features:
 * - Responsive defaults (mobile: collapsed, desktop: expanded)
 * - localStorage persistence
 * - Graceful error handling
 * - Performance optimized
 */
export function useSidebarState(): UseSidebarStateReturn {
  const [collapsed, setCollapsedState] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // ✅ Initialize state from localStorage + responsive defaults
  useEffect(() => {
    const initializeSidebarState = () => {
      try {
        setIsLoading(true);

        // Check mobile/desktop
        const isMobileDevice = window.innerWidth < MOBILE_BREAKPOINT;
        setIsMobile(isMobileDevice);

        // Get stored state
        const storedState = localStorage.getItem(SIDEBAR_STORAGE_KEY);
        
        if (storedState) {
          try {
            const parsedState: SidebarState = JSON.parse(storedState);
            
            // Use stored state if it's for the same device type
            if (parsedState.deviceType === (isMobileDevice ? 'mobile' : 'desktop')) {
              setCollapsedState(parsedState.collapsed);
            } else {
              // Different device type, use responsive default
              setCollapsedState(isMobileDevice);
            }
          } catch (parseError) {
            console.warn('Failed to parse sidebar state, using defaults:', parseError);
            setCollapsedState(isMobileDevice);
          }
        } else {
          // No stored state, use responsive default
          setCollapsedState(isMobileDevice);
        }
      } catch (error) {
        console.warn('Failed to initialize sidebar state:', error);
        // Fallback to mobile-first approach
        setCollapsedState(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSidebarState();

    // ✅ Listen for window resize to update mobile state
    const handleResize = () => {
      const newIsMobile = window.innerWidth < MOBILE_BREAKPOINT;
      if (newIsMobile !== isMobile) {
        setIsMobile(newIsMobile);
        
        // Auto-collapse on mobile, expand on desktop if no explicit user preference
        try {
          const storedState = localStorage.getItem(SIDEBAR_STORAGE_KEY);
          if (!storedState) {
            setCollapsedState(newIsMobile);
          }
        } catch (error) {
          console.warn('Resize handler error:', error);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  // ✅ Persist state to localStorage
  const persistState = useCallback((newCollapsed: boolean) => {
    try {
      const stateToStore: SidebarState = {
        collapsed: newCollapsed,
        lastUpdated: Date.now(),
        deviceType: isMobile ? 'mobile' : 'desktop',
      };
      
      localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(stateToStore));
    } catch (error) {
      console.warn('Failed to persist sidebar state:', error);
      // Continue without persistence rather than breaking functionality
    }
  }, [isMobile]);

  // ✅ Update collapsed state with persistence
  const setCollapsed = useCallback((newCollapsed: boolean) => {
    setCollapsedState(newCollapsed);
    persistState(newCollapsed);
  }, [persistState]);

  // ✅ Toggle helper
  const toggleCollapsed = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);

  return {
    collapsed,
    setCollapsed,
    toggleCollapsed,
    isLoading,
    isMobile,
  };
}

// ✅ Utility functions for advanced usage
export const sidebarStateUtils = {
  /**
   * Clear stored sidebar state (useful for logout/reset)
   */
  clearStoredState: () => {
    try {
      localStorage.removeItem(SIDEBAR_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear sidebar state:', error);
    }
  },

  /**
   * Get current stored state without React
   */
  getStoredState: (): SidebarState | null => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to get stored sidebar state:', error);
      return null;
    }
  },

  /**
   * Check if mobile device
   */
  isMobileDevice: (): boolean => {
    return typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;
  },
};