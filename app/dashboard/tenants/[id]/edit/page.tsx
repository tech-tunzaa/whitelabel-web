"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { ErrorCard } from "@/components/ui/error-card";
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { TenantForm } from "@/features/tenants/components/tenant-form";
import { useTenantStore } from "@/features/tenants/store";

interface TenantEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TenantEditPage({ params }: TenantEditPageProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tenantStore = useTenantStore();
  const params_unwrapped = use(params);
  const id = params_unwrapped.id;
  const { tenant, loading, storeError } = tenantStore;
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch once when the component mounts and if we don't have the tenant already
    if (!hasFetchedRef.current && !loading) {
      hasFetchedRef.current = true;
      tenantStore.fetchTenant(id);
    }
  }, [id]);

  const handleSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      await tenantStore.updateTenant(id, data);
      toast.success("Tenant updated successfully");
      router.push("/dashboard/tenants");
    } catch (error) {
      // console.error("Error updating tenant:", error);
      toast.error("Failed to update tenant. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!loading && storeError && !tenant) {
    return (
      <ErrorCard
        title="Error Loading Tenant"
        error={{
          message: storeError?.message || "Failed to load tenant",
          status: storeError?.status ? String(storeError.status) : "error"
        }}
        buttonText="Back to Tenants"
        buttonAction={() => router.push("/dashboard/tenants")}
        buttonIcon={ArrowLeft}
      />
    );
  }

  return tenant ? (
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
            <h1 className="text-2xl font-bold tracking-tight">
              Edit Tenant: {tenant.name}
            </h1>
            <p className="text-muted-foreground">
              Update tenant details and configurations
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        {tenant && (
          <TenantForm 
            initialData={{
              ...tenant,
              modules: {
                payments: tenant.modules?.payments || false,
                promotions: tenant.modules?.promotions || false,
                inventory: tenant.modules?.inventory || false,
              }
            }} 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting}
            id={id}
          />
        )}
      </div>
    </div>
  ) : null;
}
