"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TenantForm } from "@/features/tenants/components/tenant-form"
import { useTenantStore } from "@/features/tenants/stores/tenant-store"
import { toast } from "sonner"

export default function AddTenantPage() {
  const router = useRouter()
  const { addTenant } = useTenantStore()
  
  const handleSubmit = (data: any) => {
    // Generate a unique ID and add created_at/updated_at timestamps
    const newTenant = {
      ...data,
      id: `${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: "pending",
    }
    
    addTenant(newTenant)
    toast.success("Tenant added successfully")
    router.push("/dashboard/tenants")
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/tenants")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add New Tenant</h1>
            <p className="text-muted-foreground">
              Create a new marketplace tenant with configurations
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <TenantForm 
          onSubmit={handleSubmit} 
          onCancel={() => router.push("/dashboard/tenants")}
        />
      </div>
    </div>
  )
}
