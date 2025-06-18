"use client";

import { useState, useEffect } from "react";
import { Role } from "../types/role";
import { Edit, Trash, Shield } from "lucide-react";
import { useRoleStore } from "../stores/role-store";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface RoleDetailsDialogProps {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function RoleDetailsDialog({
  role,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: RoleDetailsDialogProps) {
  const { permissions, fetchAvailablePermissions } = useRoleStore();
  const [loading, setLoading] = useState(false);

  // Fetch permissions when dialog opens if not already loaded
  useEffect(() => {
    if (isOpen && permissions.length === 0) {
      setLoading(true);
      fetchAvailablePermissions().finally(() => setLoading(false));
    }
  }, [isOpen, permissions.length, fetchAvailablePermissions]);

  if (!role) return null;

  // Get role ID and name safely
  const roleId = role.id || role.role_id || role.role;
  const roleName = role.name || role.display_name || role.role;
  const roleDescription = role.description || "";

  // Group permissions by module
  const permissionsByModule: Record<string, typeof permissions> = {};

  // Handle different permission formats from API
  const rolePermissions = role.permissions || [];
  if (Array.isArray(rolePermissions)) {
    // Handle permissions that could be strings (IDs) or objects
    rolePermissions.forEach((permissionItem) => {
      if (typeof permissionItem === "string") {
        // Permission is just an ID string
        const permission = permissions.find(
          (p) => p.id === permissionItem || p.permission_id === permissionItem
        );
        if (permission) {
          if (!permissionsByModule[permission.module]) {
            permissionsByModule[permission.module] = [];
          }
          permissionsByModule[permission.module].push(permission);
        }
      } else if (
        typeof permissionItem === "object" &&
        permissionItem !== null
      ) {
        // Permission is an object
        const permissionObj = permissionItem as any;
        if (permissionObj.module) {
          if (!permissionsByModule[permissionObj.module]) {
            permissionsByModule[permissionObj.module] = [];
          }
          permissionsByModule[permissionObj.module].push(permissionObj);
        }
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[calc(100vh-10rem)]">
        <DialogHeader>
          <DialogTitle>Role Details</DialogTitle>
          <DialogDescription>
            Role information and permissions
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4 h-100 overflow-y-auto">
          <div>
            <h3 className="text-lg font-semibold">{roleName}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {roleDescription}
            </p>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">
              Permissions (
              {Array.isArray(role.permissions) ? role.permissions.length : 0})
            </h4>

            {loading ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            ) : Object.entries(permissionsByModule).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(permissionsByModule).map(
                  ([module, modulePermissions]) => (
                    <div key={module} className="space-y-2">
                      <h5 className="text-sm font-medium capitalize">
                        {module.replace("_", " ")}
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {modulePermissions.map((permission) => (
                          <Badge
                            key={permission.id || permission.permission_id}
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <Shield className="h-3 w-3" />
                            <span>
                              {permission.description || permission.name}
                            </span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No permissions found for this role.
              </p>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              <strong>Created:</strong>{" "}
              {role.created_at
                ? new Date(role.created_at).toLocaleDateString()
                : "Unknown"}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>
              <strong>Last Updated:</strong>{" "}
              {role.updated_at
                ? new Date(role.updated_at).toLocaleDateString()
                : "Unknown"}
            </p>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between">
          <div className="flex gap-2">
            {/* Only allow deletion of non-default roles */}
            {roleId !== "1" && role.role !== "super" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(roleId as string)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
          <Button size="sm" onClick={() => onEdit(roleId as string)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
