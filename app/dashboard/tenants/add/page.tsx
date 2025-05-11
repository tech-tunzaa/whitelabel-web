"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ErrorCard } from "@/components/ui/error-card";
import { useTenantStore } from "@/features/tenants/store";
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { TenantForm } from "@/features/tenants/components/tenant-form";

export default function TenantAddPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tenantStore = useTenantStore();
  
  // Only read storeError once on component mount or when explicitly needed
  useEffect(() => {
    // Clear any existing errors when the page loads
    tenantStore.setStoreError(null);
  }, []);

  const handleSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      const tenantData = {
        ...data,
        user_id: session?.user?.id || "13c94ad0-1071-431a-9d59-93eeee25ca0a", // Use session user ID if available
      };

      await tenantStore.createTenant(tenantData);
      toast.success("Tenant created successfully");
      router.push("/dashboard/tenants");
    } catch (error) {
      console.error("Error creating tenant:", error);
      toast.error("Failed to create tenant. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Create a new tenant account and configurations
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <TenantForm 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}