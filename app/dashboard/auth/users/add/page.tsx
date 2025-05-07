"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { useUserStore } from "@/features/auth/stores/user-store"
import { UserForm } from "@/features/auth/components/user-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function AddUserPage() {
  const router = useRouter()
  const { addUser } = useUserStore()
  
  const handleSubmit = (data: any) => {
    // Generate a unique ID for the new user
    const newUser = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null
    }
    
    addUser(newUser)
    toast.success("User created successfully")
    router.push("/dashboard/auth/users")
  }
  
  const handleCancel = () => {
    router.push("/dashboard/auth/users")
  }
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center space-x-2 mx-4">
        <Button variant="outline" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Add New User</h1>
      </div>
      <Separator />
      
      <UserForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  )
}
