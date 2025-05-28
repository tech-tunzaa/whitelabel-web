"use client"

import { useState } from "react"
import { User } from "../types/user"
import { ShieldCheck, ShieldOff, Edit, Calendar, Mail, Phone, Star } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserDetailsDialogProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onActivate: (id: string) => void
  onDeactivate: (id: string) => void
  onEdit: (id: string) => void
}

export function UserDetailsDialog({
  user,
  isOpen,
  onClose,
  onActivate,
  onDeactivate,
  onEdit,
}: UserDetailsDialogProps) {
  if (!user) return null

  // Get user's full name (accounting for API structure)
  const fullName = user.name || `${user.first_name} ${user.last_name}`;
  
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getRoleBadge = (role?: string) => {
    if (!role) return <Badge variant="outline">No Role</Badge>;
    
    switch (role.toLowerCase()) {
      case "super_owner":
        return <Badge className="bg-purple-500">Super Owner</Badge>
      case "admin":
        return <Badge className="bg-blue-500">Admin</Badge>
      case "sub_admin":
        return <Badge className="bg-green-500">Sub Admin</Badge>
      case "support":
        return <Badge className="bg-amber-500">Support</Badge>
      case "vendor":
        return <Badge className="bg-orange-500">Vendor</Badge>
      case "buyer":
        return <Badge className="bg-teal-500">Buyer</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>User information and account details</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {/* API user doesn't have avatar currently */}
              <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{fullName}</h3>
              <div className="flex items-center gap-2 mt-1">
                {getRoleBadge(user.active_profile_role || user.activeProfileRole)}
                <Badge
                  variant={user.is_active ? "default" : "destructive"}
                >
                  {user.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{user.email}</span>
            </div>
            {(user.phone_number || user.phone) && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.phone_number || user.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Role: {(user.active_profile_role || user.activeProfileRole || 'unknown').replace("_", " ")}
              </span>
            </div>
            {user.tenant_id && (
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Tenant ID: {user.tenant_id}</span>
              </div>
            )}
            {(user.created_at || user.createdAt) && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Created: {new Date(user.created_at || user.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}
            {(user.last_login || user.lastLogin) && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Last Login: {new Date(user.last_login || user.lastLogin).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between">
          <div className="flex gap-2">
            {user.is_active ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeactivate(user.id || user.user_id)}
              >
                <ShieldOff className="mr-2 h-4 w-4" />
                Deactivate
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onActivate(user.id || user.user_id)}
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Activate
              </Button>
            )}
          </div>
          <Button size="sm" onClick={() => onEdit(user.id || user.user_id)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
