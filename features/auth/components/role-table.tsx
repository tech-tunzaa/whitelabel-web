"use client"

import { useState } from "react"
import { Role } from "../types/role"
import { MoreHorizontal, Edit, Trash, Eye } from "lucide-react"

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
import { Card, CardContent } from "@/components/ui/card"

interface RoleTableProps {
  roles: Role[]
  onRoleClick: (role: Role) => void
  onEditRole: (id: string) => void
  onDeleteRole: (id: string) => void
}

export function RoleTable({ 
  roles, 
  onRoleClick, 
  onEditRole,
  onDeleteRole
}: RoleTableProps) {
  return (
    <Card className="mx-4">
      <CardContent className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24">
                No roles found.
              </TableCell>
            </TableRow>
          ) : (
            roles.map((role) => (
              <TableRow key={role.id || role.role_id || role.role}>
                <TableCell className="font-medium">
                  {role.name || role.display_name || role.role}
                </TableCell>
                <TableCell>{role.description || '-'}</TableCell>
                <TableCell>
                  {Array.isArray(role.permissions) ? role.permissions.length : 0} permissions
                </TableCell>
                <TableCell>
                  {(role.created_at || role.createdAt) ? 
                    new Date(role.created_at || role.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : '-'}
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
                      <DropdownMenuItem onClick={() => onRoleClick(role)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditRole(role.id || role.role_id || role.role)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      {/* Only show delete for non-default roles */}
                      {(role.id !== '1' && role.role !== 'super_owner') && (
                        <DropdownMenuItem onClick={() => onDeleteRole(role.id || role.role_id || role.role)}>
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
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
