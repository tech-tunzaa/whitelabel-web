/**
 * Centralized Authentication Module
 *
 * This module provides a simple, centralized authentication system using
 * Zustand for state management and the API client for server communication.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from './api';

// Types
export interface AuthUser {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  active_profile_role?: string;
  profiles?: {
    profile_id: string;
    role: string;
    display_name: string | null;
    is_active: boolean;
    metadata: Record<string, any>;
  }[];
  roles?: { role: string; }[];
  is_verified: boolean;
  tenant_id?: string | null;
  name?: string;
  provider?: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface CustomUser {
  email: string;
  token: string;
  name: string;
  role: "super_owner" | "admin" | "sub_admin" | "support";
  tenant_id: string;
  accessToken: string;
}

// Role mapping from API roles to application roles
const ROLE_MAP: Record<string, "super_owner" | "admin" | "sub_admin" | "support"> = {
  'super': 'super_owner',
  'admin': 'admin',
  'staff': 'sub_admin',
  'support': 'support',
  'buyer': 'admin',   // Map buyer role to admin by default
  'vendor': 'admin',  // Map vendor role to admin by default
};

/**
 * Maps an API role to the application's internal role system
 */
export function mapApiRole(apiRole: string): "super_owner" | "admin" | "sub_admin" | "support" {
  return ROLE_MAP[apiRole] || 'admin';
}

/**
 * Extracts the role from the user data
 */
export function extractUserRole(user: AuthUser): string {
  if (user.active_profile_role) {
    return user.active_profile_role;
  }
  
  if (user.profiles && user.profiles.length > 0) {
    return user.profiles[0].role;
  }
  
  if (user.roles && user.roles.length > 0) {
    return user.roles[0].role;
  }
  
  return 'admin'; // Default role
}

/**
 * Authentication store using Zustand
 */
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

/**
 * Centralized auth store
 */
export const useAuthStore = create<AuthState>()(persist(
  (set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    
    login: async (email, password) => {
      try {
        set({ isLoading: true, error: null });
        const userData = await api.auth.login(email, password);
        set({
          user: userData,
          isAuthenticated: true,
          isLoading: false
        });
      } catch (error: any) {
        set({
          error: error.message || 'Login failed',
          isLoading: false
        });
      }
    },
    
    logout: () => {
      api.auth.logout();
      set({
        user: null,
        isAuthenticated: false
      });
    },
    
    clearError: () => set({ error: null })
  }),
  {
    name: 'auth-storage',
    partialize: (state) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated
    })
  }
));

// For backward compatibility with existing code
export async function authenticateUser(email: string, password: string): Promise<AuthUser> {
  return api.auth.login(email, password);
}

export async function refreshAuthToken(): Promise<{ access_token: string; refresh_token: string }> {
  const refreshToken = api.auth.getRefreshToken() || '';
  return api.auth.refreshToken(refreshToken);
}

export function logoutUser(): void {
  api.auth.logout();
}

// Export the auth module
export default {
  useAuthStore,
  mapApiRole,
  extractUserRole,
  authenticateUser,
  refreshAuthToken,
  logoutUser
};
