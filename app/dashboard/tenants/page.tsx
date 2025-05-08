"use client"

import { Button } from "@/components/ui/button"
import { TenantContent } from "@/features/tenants/components/tenant-content"

export default function TenantsPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tenants</h1>
          <p className="text-muted-foreground">
            Manage marketplace tenants and their configurations
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/tenants/add")}>
          Add Tenant
        </Button>
      </div>

      <TenantContent />
    </div>
  )
}
