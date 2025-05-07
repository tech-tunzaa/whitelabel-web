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
  const { getRole, updateRole } = useRoleStore()
  const [role, setRole] = useState<any>(null)
  
  useEffect(() => {
    // Fetch the role data
    const roleData = getRole(params.id)
    if (roleData) {
      setRole(roleData)
    } else {
      toast.error("Role not found")
      router.push("/dashboard/auth/roles")
    }
  }, [params.id, getRole, router])
  
  const handleSubmit = (data: any) => {
    // Don't allow editing the permissions for the Super Owner role
    if (params.id === '1' && data.permissions.length < role.permissions.length) {
      toast.error("Cannot remove permissions from the Super Owner role")
      return
    }
    
    const updatedRole = {
      ...role,
      ...data,
      updatedAt: new Date().toISOString()
    }
    
    updateRole(updatedRole)
    toast.success("Role updated successfully")
    router.push("/dashboard/auth/roles")
  }
  
  const handleCancel = () => {
    router.push("/dashboard/auth/roles")
  }
  
  if (!role) {
    return <div className="container py-6">Loading...</div>
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
