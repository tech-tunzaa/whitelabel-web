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
  const { createRole } = useRoleStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      // Format data for API request if needed
      await createRole(data)
      toast.success("Role created successfully")
      router.push("/dashboard/auth/roles")
    } catch (error) {
      toast.error("Failed to create role")
      console.error("Error creating role:", error)
    } finally {
      setIsSubmitting(false)
    }
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
