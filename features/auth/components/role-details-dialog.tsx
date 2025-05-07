"use client"

import { useState } from "react"
import { Role } from "../types/role"
import { Edit, Trash, Shield } from "lucide-react"
import { useRoleStore } from "../stores/role-store"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface RoleDetailsDialogProps {
  role: Role | null
  isOpen: boolean
  onClose: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function RoleDetailsDialog({
  role,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: RoleDetailsDialogProps) {
  const { permissions } = useRoleStore()
  
  if (!role) return null

  // Group permissions by module
  const permissionsByModule: Record<string, typeof permissions> = {}
  
  role.permissions.forEach(permissionId => {
    const permission = permissions.find(p => p.id === permissionId)
    if (permission) {
      if (!permissionsByModule[permission.module]) {
        permissionsByModule[permission.module] = []
      }
      permissionsByModule[permission.module].push(permission)
    }
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Role Details</DialogTitle>
          <DialogDescription>Role information and permissions</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div>
            <h3 className="text-lg font-semibold">{role.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Permissions ({role.permissions.length})</h4>
            
            <div className="space-y-4">
              {Object.entries(permissionsByModule).map(([module, modulePermissions]) => (
                <div key={module} className="space-y-2">
                  <h5 className="text-sm font-medium capitalize">{module.replace('_', ' ')}</h5>
                  <div className="flex flex-wrap gap-2">
                    {modulePermissions.map(permission => (
                      <Badge key={permission.id} variant="outline" className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        <span>{permission.description}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground mt-2">
            <p>Created: {new Date(role.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}</p>
            <p>Last Updated: {new Date(role.updatedAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}</p>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between">
          <div className="flex gap-2">
            {/* Only allow deletion of non-default roles */}
            {role.id !== '1' && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(role.id)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
          <Button size="sm" onClick={() => onEdit(role.id)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
