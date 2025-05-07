"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { useUserStore } from "@/features/auth/stores/user-store"
import { UserForm } from "@/features/auth/components/user-form"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"

import { Button } from "@/components/ui/button"

interface EditUserPageProps {
  params: {
    id: string
  }
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const router = useRouter()
  const { getUser, updateUser } = useUserStore()
  const [user, setUser] = useState<any>(null)
  
  useEffect(() => {
    // Fetch the user data
    const userData = getUser(params.id)
    if (userData) {
      setUser(userData)
    } else {
      toast.error("User not found")
      router.push("/dashboard/auth/users")
    }
  }, [params.id, getUser, router])
  
  const handleSubmit = (data: any) => {
    const updatedUser = {
      ...user,
      ...data,
      updatedAt: new Date().toISOString()
    }
    
    updateUser(updatedUser)
    toast.success("User updated successfully")
    router.push("/dashboard/auth/users")
  }
  
  const handleCancel = () => {
    router.push("/dashboard/auth/users")
  }
  
  if (!user) {
    return <div className="container py-6">Loading...</div>
  }
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center space-x-2 mx-4">
        <Button variant="outline" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Edit User: {user.name}</h1>
      </div>
      <Separator />
      
      <UserForm onSubmit={handleSubmit} onCancel={handleCancel} initialData={user} />
    </div>
  )
}
