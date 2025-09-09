import { create } from 'zustand';
import { AuthState, Permission, Role } from "./types";
import apiClient from '@/lib/api/client';
import { extractUserRoles } from '@/lib/core/auth';

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  permissions: [],
  isLoading: false,
  error: null,
  setUser: (user) => set({ user, permissions: [], error: null }),

  fetchPermissions: async (userId: string, headers?: Record<string, string>) => {
    if (!userId) {
      set({ permissions: [], isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const response = await apiClient.get<any>(
        `/auth/roles/users/${userId}/permissions`,
        undefined,
        headers
      );

      let permissionsData: Permission[] = [];
      if (response.data && response.data.data) {
        permissionsData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        permissionsData = response.data;
      }

      set({ permissions: permissionsData, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      set({ permissions: [], isLoading: false });
    }
  },

  hasPermission: (requiredPermission: Permission) => {
    const { permissions } = get();
    if (permissions.includes('*')) {
      return true; // Super admin can do anything
    }
    return permissions.includes(requiredPermission);
  },

  hasRole: (requiredRole: Role) => {
    const { user } = get();
    if (!user) {
      return false;
    }
    const userRoles = extractUserRoles(user);
    return userRoles.includes(requiredRole);
  },

  canAccess: (requiredPermission?: Permission, requiredRole?: Role) => {
    const { hasPermission, hasRole } = get();
    
    // If both permission and role are required, user must have both
    if (requiredPermission && requiredRole) {
      return hasPermission(requiredPermission) && hasRole(requiredRole);
    }
    
    // If only permission is required
    if (requiredPermission) {
      return hasPermission(requiredPermission);
    }
    
    // If only role is required
    if (requiredRole) {
      return hasRole(requiredRole);
    }
    
    // If neither is specified, allow access
    return true;
  },
}));

export default useAuthStore;
