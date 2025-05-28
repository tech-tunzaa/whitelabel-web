"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { useRoleStore } from "@/features/auth/stores/role-store"
import { RoleForm } from "@/features/auth/components/role-form"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"

import { Button } from "@/components/ui/button"

interface EditRolePageProps {
  params: {
    id: string
  }
}

export default function EditRolePage({ params }: EditRolePageProps) {
  const router = useRouter()
  const { fetchRole, updateRole } = useRoleStore()
  const [role, setRole] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function loadRole() {
      setLoading(true)
      try {
        // Fetch the role data from API
        await fetchRole(params.id)
          .then((roleData) => {
            if (roleData) {
              setRole(roleData)
            } else {
              setError('Role not found')
              toast.error("Role not found")
              router.push("/dashboard/auth/roles")
            }
          })
      } catch (err) {
        console.error('Error fetching role:', err)
        setError('Failed to load role data')
        toast.error("Failed to load role data")
      } finally {
        setLoading(false)
      }
    }
    
    loadRole()
  }, [params.id, fetchRole, router])
  
  const handleSubmit = async (data: any) => {
    try {
      // Don't allow editing the permissions for the Super Owner role
      if (params.id === '1' && data.permissions.length < role.permissions.length) {
        toast.error("Cannot remove permissions from the Super Owner role")
        return
      }
      
      // Format data for API request
      const updatedRole = {
        ...data,
        // API will handle timestamps automatically
      }
      
      await updateRole(params.id, updatedRole)
      toast.success("Role updated successfully")
      router.push("/dashboard/auth/roles")
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error("Failed to update role")
    }
  }
  
  const handleCancel = () => {
    router.push("/dashboard/auth/roles")
  }
  
  if (loading) {
    return <div className="container py-6">Loading role data...</div>
  }
  
  if (error || !role) {
    return <div className="container py-6">Error: {error || 'Role not found'}</div>
  }
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center space-x-2 mx-4">
        <Button variant="outline" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Edit Role: {role.name}</h1>
      </div>
      <Separator />
      
      <RoleForm onSubmit={handleSubmit} onCancel={handleCancel} initialData={role} />
    </div>
  )
}
