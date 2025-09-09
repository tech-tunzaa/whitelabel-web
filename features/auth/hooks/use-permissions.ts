import useAuthStore from '../store';
import { Permission, Role } from '../types';

/**
 * Custom hook to check user permissions and roles.
 * Provides a simple interface to the auth store.
 *
 * @returns An object with:
 *  - `can`: A function to check if the user has a specific permission.
 *  - `hasRole`: A function to check if the user has a specific role.
 *  - `canAccess`: A function to check if the user has both permission and role.
 *  - `isLoading`: A boolean indicating if permissions are being loaded.
 *  - `permissions`: An array of all permissions the user has.
 *  - `user`: The current user object.
 */
export const usePermissions = () => {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const hasRole = useAuthStore((state) => state.hasRole);
  const canAccess = useAuthStore((state) => state.canAccess);
  const isLoading = useAuthStore((state) => state.isLoading);
  const permissions = useAuthStore((state) => state.permissions);
  const user = useAuthStore((state) => state.user);

  const can = (permission: Permission) => {
    return hasPermission(permission);
  };

  return { can, hasRole, canAccess, isLoading, permissions, user };
};
