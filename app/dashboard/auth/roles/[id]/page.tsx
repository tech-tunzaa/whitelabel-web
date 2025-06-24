"use client";

import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRoleStore } from '@/features/auth/stores/role-store';
import { Role, Permission } from '@/features/auth/types/role';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Shield, Key } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ErrorCard } from '@/components/ui/error-card';
import { Spinner } from '@/components/ui/spinner';

export default function RoleDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const roleId = params.id as string;

  const { 
    roles,
    loading, 
    storeError, 
    fetchRoles 
  } = useRoleStore();
  const tenantId = session?.user?.tenant_id;

  useEffect(() => {
    // Only fetch if roles are not already in the store to avoid unnecessary API calls
    if (tenantId && roles.length === 0) {
      fetchRoles(undefined, { 'X-Tenant-ID': tenantId });
    }
  }, [tenantId, roles.length, fetchRoles]);

  const role = useMemo(() => {
    if (!roleId || !roles || roles.length === 0) return undefined;
    const decodedId = decodeURIComponent(roleId);
    // Find the role from the store by matching the 'role' property (e.g., 'super')
    return roles.find(r => r.role === decodedId);
  }, [roleId, roles]);

  const groupedPermissions = useMemo(() => {
    if (!role?.permissions) return {};
    return role.permissions.reduce((acc, permission: Permission | string) => {
      const permissionName = typeof permission === 'string' ? permission : permission.name;
      const module = typeof permission === 'string' ? permissionName.split(':')[0] : permission.module || permissionName.split(':')[0];
      const action = permissionName.split(':').pop() || permissionName;
      
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push(action);
      return acc;
    }, {} as Record<string, string[]>);
  }, [role]);

  if (loading && !role) {
    return (
      <Spinner />
    );
  }

  if (!role) {
    return (
      <ErrorCard 
        title={storeError ? "Failed to Load Role" : "Role Not Found"}
        error={storeError ? { message: storeError.message, status: String(storeError.status) } : { message: "The role you are looking for does not exist or could not be loaded.", status: '404' }}
        buttonText="Go Back to Roles"
        buttonAction={() => router.push('/dashboard/auth/roles')}
        buttonIcon={ArrowLeft}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div className="flex items-center gap-3">
            <div className="bg-muted rounded-full p-3 flex items-center justify-center">
                <Shield className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl capitalize font-bold tracking-tight">{role.role}</h1>
              <p className="text-muted-foreground text-sm flex items-center gap-1">
                <Key className="h-3 w-3" />
                Role: {role.role}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
        {role.is_system_role ? (
            <Badge variant="secondary">System Role</Badge>
        ) : (
            <Badge variant="outline">Custom Role</Badge>
        )}
        <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/auth/roles/${role.role}/edit`)}>
            <Edit className="h-4 w-4 mr-2" /> Edit
        </Button>
        </div>
      </div>

      <Separator />

      {/* Content */}
      <div className="p-4 md:p-6 space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{role.description || "No description provided."}</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Permissions</CardTitle>
                <CardDescription>This role has a total of {role.permissions?.length || 0} permissions.</CardDescription>
            </CardHeader>
            <CardContent>
                {Object.keys(groupedPermissions).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Object.entries(groupedPermissions).map(([module, actions]) => (
                            <Card key={module} className="flex flex-col gap-4 py-2">
                                <CardHeader className="p-2 px-3">
                                    <CardTitle className="text-base capitalize font-semibold">{module.replace(/_/g, ' ')}</CardTitle>
                                    <CardDescription className="text-xs">{actions.length} permissions</CardDescription>
                                </CardHeader>
                                <CardContent className="p-2 px-3 pt-0 flex-grow">
                                    <div className="flex flex-wrap gap-1">
                                        {actions.map((action) => (
                                            <Badge key={action} variant="secondary" className="font-normal text-xs">{action}</Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">No permissions assigned to this role.</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}