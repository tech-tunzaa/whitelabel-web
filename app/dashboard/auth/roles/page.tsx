"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search } from "lucide-react"
import { useRoleStore } from "@/features/auth/stores/role-store"
import { Role } from "@/features/auth/types/role"
import { RoleTable } from "@/features/auth/components/role-table"
import { RoleDetailsDialog } from "@/features/auth/components/role-details-dialog"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function RolesPage() {
  const router = useRouter()
  const {
    roles,
    loading,
    storeError,
    selectedRole,
    selectRole,
    deleteRole,
    setSearchQuery,
    getFilteredRoles,
    fetchRoles
  } = useRoleStore()
  
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  
  // Fetch roles on component mount
  useEffect(() => {
    const loadRoles = async () => {
      try {
        await fetchRoles()
      } catch (error) {
        console.error('Failed to load roles:', error)
      }
    }
    
    loadRoles()
  }, [fetchRoles])
  
  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }
  
  // Handle role selection
  const handleRoleClick = (role: Role) => {
    selectRole(role)
    setIsDetailsOpen(true)
  }
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setIsDetailsOpen(false)
  }
  
  // Handle role deletion
  const handleDeleteRole = async (id: string) => {
    // Don't allow deletion of the Super Owner role
    if (id === '1' || id === 'super') {
      toast.error("Cannot delete the Super Owner role")
      return
    }
    
    try {
      await deleteRole(id)
      toast.success("Role deleted successfully")
      setIsDetailsOpen(false)
    } catch (error) {
      console.error('Failed to delete role:', error)
      toast.error("Failed to delete role")
    }
  }
  
  // Navigate to edit role page
  const handleEditRole = (id: string) => {
    router.push(`/dashboard/auth/roles/${id}/edit`)
    setIsDetailsOpen(false)
  }
  
  // Navigate to add role page
  const handleAddRole = () => {
    router.push('/dashboard/auth/roles/add')
  }
  
  // Get filtered roles
  const filteredRoles = getFilteredRoles()
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mx-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">
            Manage user roles
          </p>
        </div>
        
        <Button onClick={handleAddRole}>
          <Plus className="mr-2 h-4 w-4" />
          Add Role
        </Button>
      </div>
      <Separator />

      <div className="relative w-full md:w-auto mx-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search roles..."
          className="pl-8 w-full md:w-[300px]"
          onChange={handleSearch}
        />
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : storeError ? (
        <div className="text-center py-8 text-destructive">
          <p>Error loading roles: {storeError.message}</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => fetchRoles()}
          >
            Retry
          </Button>
        </div>
      ) : (
        <RoleTable
          roles={filteredRoles}
          onRoleClick={handleRoleClick}
          onEditRole={handleEditRole}
          onDeleteRole={handleDeleteRole}
        />
      )}
      
      <RoleDetailsDialog
        role={selectedRole}
        isOpen={isDetailsOpen}
        onClose={handleCloseDialog}
        onEdit={handleEditRole}
        onDelete={handleDeleteRole}
      />
    </div>
  )
}
