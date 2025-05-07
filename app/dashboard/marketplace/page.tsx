"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { Edit, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

import { Tenant } from "@/features/tenants/types/tenant";
import { useTenantStore } from "@/features/tenants/stores/tenant-store";
import { TenantFormValues } from "@/features/tenants/types/tenant-form";
import { TenantForm } from "@/features/tenants/components/tenant-form";

export default function MarketplacePage() {
  const { data: session } = useSession();
  const { tenants } = useTenantStore();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Use tenant with ID 1
  const currentTenantId = "1";

  useEffect(() => {
    // Ensure we're using consistent formatting for ID comparison
    if (tenants.length > 0) {
      // First try to find by exact ID match
      let foundTenant = tenants.find(tenant => tenant.id === currentTenantId);
      
      // If not found, fallback to first tenant as default
      if (!foundTenant && tenants.length > 0) {
        foundTenant = tenants[0];
        console.log('Using first tenant as fallback', foundTenant);
      }
      
      if (foundTenant) {
        console.log('Setting tenant:', foundTenant);
        setTenant(foundTenant);
      } else {
        console.warn('No tenant found with ID', currentTenantId);
      }
    } else {
      console.warn('No tenants available in the store');
    }
  }, [tenants, currentTenantId]);

  const onSubmit = (data: TenantFormValues) => {
    if (!isEditing) return;
    
    setIsSubmitting(true);
    
    console.log("Submitting data:", data);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Marketplace settings updated!");
      setIsSubmitting(false);
      setIsEditing(false);
    }, 1000);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  return (
    <div className="container py-10 space-y-8">
      <div className="flex justify-between items-center mx-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marketplace Settings</h1>
          <p className="text-muted-foreground">
            Customize your marketplace appearance and functionality
          </p>
        </div>
        <div className="flex items-center gap-4">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="marketplace-tenant-form"
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting && (
                  <span className="mr-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </span>
                )}
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Customize Marketplace
            </Button>
          )}
        </div>
      </div>

      <Separator/>
      <TenantForm 
        initialData={tenant} 
        onSubmit={onSubmit} 
        isEditable={isEditing}
        id="tenant-form"
      />
    </div>
  );
}
