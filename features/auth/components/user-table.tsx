"use client"

import { useState } from "react"
import { User } from "../types/user"
import { 
  MoreHorizontal, 
  Edit, 
  Trash, 
  Eye, 
  ShieldCheck, 
  ShieldOff 
} from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface UserTableProps {
  users: User[]
  onUserClick: (user: User) => void
  onActivateUser: (id: string) => void
  onDeactivateUser: (id: string) => void
  onEditUser: (id: string) => void
}

export function UserTable({ 
  users, 
  onUserClick, 
  onActivateUser, 
  onDeactivateUser,
  onEditUser
}: UserTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>
      case "inactive":
        return <Badge variant="destructive">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "super_owner":
        return <Badge className="bg-purple-500">Super Owner</Badge>
      case "admin":
        return <Badge className="bg-blue-500">Admin</Badge>
      case "sub_admin":
        return <Badge className="bg-green-500">Sub Admin</Badge>
      case "support":
        return <Badge className="bg-amber-500">Support</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  return (
    <Card className="mx-4">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {user.avatar && (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="h-6 w-6 rounded-full"
                      />
                    )}
                    {user.name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {getRoleBadge(user.role)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(user.status)}
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    }) : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onUserClick(user)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditUser(user.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {user.status === "active" ? (
                          <DropdownMenuItem onClick={() => onDeactivateUser(user.id)}>
                            <ShieldOff className="mr-2 h-4 w-4" />
                            Deactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => onActivateUser(user.id)}>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Activate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
