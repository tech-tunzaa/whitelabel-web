"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { Tenant } from "../types/tenant"
import { Card, CardContent } from "@/components/ui/card"

interface TenantTableProps {
  tenants: Tenant[]
  onActivateTenant: (tenantId: string) => void
  onDeactivateTenant: (tenantId: string) => void
}

export function TenantTable({ tenants, onActivateTenant, onDeactivateTenant }: TenantTableProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Handle undefined tenants
  if (!tenants) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Filter tenants based on status
  const filteredTenants = tenants.filter(tenant => {
    if (typeof tenant.status === 'string') {
      return tenant.status.toLowerCase() !== 'deleted'
    }
    return true
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>
      case "inactive":
        return <Badge variant="destructive">Inactive</Badge>
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  No tenants found
                </TableCell>
              </TableRow>
            ) : (
              filteredTenants.map((tenant) => (
                <TableRow 
                  key={tenant.id} 
                  onClick={() => router.push(`/dashboard/tenants/${tenant.id}`)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-md flex items-center justify-center overflow-hidden bg-muted" 
                        style={{ backgroundColor: tenant.branding.theme.colors.background.primary }}
                      >
                        {tenant.branding.logoUrl ? (
                          <img 
                            src={tenant.branding.logoUrl} 
                            alt={tenant.name} 
                            className="object-contain w-6 h-6" 
                          />
                        ) : (
                          <span 
                            className="text-sm font-medium" 
                            style={{ color: tenant.branding.theme.colors.text.primary }}
                          >
                            {tenant.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{tenant.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{tenant.domain}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                        <Badge variant="outline">{tenant.country}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{tenant.admin_email}</span>
                      <span className="text-xs text-muted-foreground">{tenant.admin_phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                  <TableCell>{new Date(tenant.created_at).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => router.push(`/dashboard/tenants/${tenant.id}/edit`) }
                        >
                          Edit
                        </DropdownMenuItem>

                        {tenant.status === "active" ? (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeactivateTenant(tenant.id)
                            }}
                          >
                            Deactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onActivateTenant(tenant.id)
                            }}
                          >
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
