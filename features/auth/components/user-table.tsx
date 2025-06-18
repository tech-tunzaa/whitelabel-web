"use client";

import { useState } from "react";
import { User } from "../types/user";
import {
  MoreHorizontal,
  Edit,
  Trash,
  Eye,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface UserTableProps {
  users: User[];
  onUserClick: (user: User) => void;
  onActivateUser: (id: string) => void;
  onDeactivateUser: (id: string) => void;
  onEditUser: (id: string) => void;
}

export function UserTable({
  users,
  onUserClick,
  onActivateUser,
  onDeactivateUser,
  onEditUser,
}: UserTableProps) {
  const getStatusBadge = (isActive?: boolean) => {
    if (isActive === true) {
      return <Badge variant="default">Active</Badge>;
    } else if (isActive === false) {
      return <Badge variant="destructive">Inactive</Badge>;
    } else {
      return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRoleBadge = (role?: string) => {
    if (!role) return <Badge variant="outline">No Role</Badge>;

    switch (role.toLowerCase()) {
      case "super":
        return <Badge className="bg-purple-500">Super Owner</Badge>;
      case "admin":
        return <Badge className="bg-blue-500">Admin</Badge>;
      case "sub_admin":
        return <Badge className="bg-green-500">Sub Admin</Badge>;
      case "support":
        return <Badge className="bg-amber-500">Support</Badge>;
      case "vendor":
        return <Badge className="bg-orange-500">Vendor</Badge>;
      case "buyer":
        return <Badge className="bg-teal-500">Buyer</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

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
                <TableRow key={user.id || user.user_id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {/* No avatar in API user model currently */}
                    {user.name || `${user.first_name} ${user.last_name}`}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {getRoleBadge(
                      user.active_profile_role || user.activeProfileRole
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(user.is_active)}</TableCell>
                  <TableCell>
                    {user.last_login
                      ? new Date(user.last_login).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : "Never"}
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
                        <DropdownMenuItem
                          onClick={() => onEditUser(user.id || user.user_id)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {user.is_active ? (
                          <DropdownMenuItem
                            onClick={() =>
                              onDeactivateUser(user.id || user.user_id)
                            }
                          >
                            <ShieldOff className="mr-2 h-4 w-4" />
                            Deactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() =>
                              onActivateUser(user.id || user.user_id)
                            }
                          >
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
  );
}
