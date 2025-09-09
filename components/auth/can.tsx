import React from 'react';
import { usePermissions } from '@/features/auth/hooks/use-permissions';
import { Permission, Role } from '@/features/auth/types';

interface CanProps {
  permission?: Permission;
  role?: Role;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A component that renders its children only if the current user has the
 * specified permission and/or role.
 *
 * @param {CanProps} props - The props for the component.
 * @param {Permission} [props.permission] - The permission required to render the children.
 * @param {Role} [props.role] - The role required to render the children.
 * @param {React.ReactNode} props.children - The content to render if the user has permission/role.
 * @param {React.ReactNode} [props.fallback] - An optional fallback to render if the user lacks permission/role.
 * @returns {React.ReactElement | null} The children, the fallback, or null.
 */
export const Can: React.FC<CanProps> = ({ permission, role, children, fallback = null }) => {
  const { canAccess, isLoading } = usePermissions();

  // Do not render anything while permissions are loading to avoid flicker
  if (isLoading) {
    return null;
  }

  if (canAccess(permission, role)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
