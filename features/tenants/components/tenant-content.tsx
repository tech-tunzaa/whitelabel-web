"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { TenantTable } from "./tenant-table"
import { useTenantStore } from "../stores/tenant-store"
import { Tenant } from "../types/tenant"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function TenantContent() {
  const router = useRouter()
  const { tenants, searchQuery, setSearchQuery, updateTenantStatus, getFilteredTenants } = useTenantStore()
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isLoading, setIsLoading] = useState(false)

  // Handle loading state
  if (!tenants) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Filter tenants based on status and search query
  const filteredTenants = tenants.filter(tenant => {
    if (selectedStatus === "all") return true
    return tenant.status === selectedStatus
  })
  
  const handleActivateTenant = (tenantId: string) => {
    updateTenantStatus(tenantId, "active")
  }
  
  const handleDeactivateTenant = (tenantId: string) => {
    updateTenantStatus(tenantId, "inactive")
  }

  const handleSearch = () => {
    setSelectedStatus("all")
  }

  // Count tenants by status
  const allTenantsCount = getFilteredTenants().length
  const activeTenantsCount = getFilteredTenants().filter(t => t.status === "active").length
  const pendingTenantsCount = getFilteredTenants().filter(t => t.status === "pending").length
  const inactiveTenantsCount = getFilteredTenants().filter(t => t.status === "inactive").length
  
  return (
    <div className="space-y-4 mt-4">
      <div className="flex flex-col gap-4">
        <div className="relative w-full mx-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tenants..."
            className="pl-8 w-full md:w-[250px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyUp={(e) => handleSearch()}
          />
        </div>
        
        <div className="px-4 pt-2">
          <Tabs 
            defaultValue="all" 
            value={selectedStatus}
            onValueChange={setSelectedStatus}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="all">
                All Tenants ({allTenantsCount})
              </TabsTrigger>
              <TabsTrigger value="active">
                Active ({activeTenantsCount})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({pendingTenantsCount})
              </TabsTrigger>
              <TabsTrigger value="inactive">
                Inactive ({inactiveTenantsCount})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              <TenantTable 
                tenants={filteredTenants}
                onActivateTenant={handleActivateTenant}
                onDeactivateTenant={handleDeactivateTenant}
              />
            </TabsContent>
            
            <TabsContent value="active" className="space-y-4">
              <TenantTable 
                tenants={filteredTenants}
                onActivateTenant={handleActivateTenant}
                onDeactivateTenant={handleDeactivateTenant}
              />
            </TabsContent>
            
            <TabsContent value="pending" className="space-y-4">
              <TenantTable 
                tenants={filteredTenants}
                onActivateTenant={handleActivateTenant}
                onDeactivateTenant={handleDeactivateTenant}
              />
            </TabsContent>
            
            <TabsContent value="inactive" className="space-y-4">
              <TenantTable 
                tenants={filteredTenants}
                onActivateTenant={handleActivateTenant}
                onDeactivateTenant={handleDeactivateTenant}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
