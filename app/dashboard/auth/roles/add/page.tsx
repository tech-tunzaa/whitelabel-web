"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { useRoleStore } from "@/features/auth/stores/role-store"
import { RoleForm } from "@/features/auth/components/role-form"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"

import { Button } from "@/components/ui/button"

export default function AddRolePage() {
  const router = useRouter()
  const { addRole } = useRoleStore()
  
  const handleSubmit = (data: any) => {
    // Generate a unique ID for the new role
    const newRole = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    addRole(newRole)
    toast.success("Role created successfully")
    router.push("/dashboard/auth/roles")
  }
  
  const handleCancel = () => {
    router.push("/dashboard/auth/roles")
  }
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center space-x-2 mx-4">
        <Button variant="outline" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Create New Role</h1>
      </div>
      <Separator />
      
      <RoleForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  )
}
