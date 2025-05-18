"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Edit, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ErrorCard } from "@/components/ui/error-card";
import { TenantForm } from "@/features/tenants/components/tenant-form";
import { useTenantStore } from "@/features/tenants/store";
import { Spinner } from "@/components/ui/spinner";

export default function MarketplacePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = session?.user?.role || "";
  const isSuperOwner = userRole === "super_owner";
  const tenantId = session?.user?.tenant_id;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const tenantStore = useTenantStore();
  const { tenant, loading, storeError } = tenantStore;
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch once when the component mounts
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      
      tenantStore.fetchTenant(tenantId).catch((error) => {
        console.error("Error fetching marketplace tenant:", error);
      });
    }
  }, [tenantId, tenantStore]);

  const onSubmit = async (data: Record<string, any>) => {
    console.log("Marketplace form data:", data);
    setIsSubmitting(true);
    try {
      await tenantStore.updateTenant(tenantId, data);
      toast.success("Marketplace settings updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating marketplace settings:", error);
      toast.error("Failed to update marketplace settings. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  if (loading && !isSubmitting) {
    return <Spinner />;
  }

  if (!tenantId && isSuperOwner) {
    router.push("/dashboard/tenants");
    return;
  }

  // Error handling consistent with tenant edit page
  if (!loading && storeError && !tenant) {
    return (
      <ErrorCard
        title="Error Loading Marketplace"
        error={{
          message: storeError?.message || "Failed to load marketplace settings",
          status: storeError?.status ? String(storeError.status) : "error",
        }}
        buttonText="Back to Dashboard"
        buttonAction={() => router.push("/dashboard")}
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
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Marketplace Settings
            </h1>
            <p className="text-muted-foreground">
              Customize your marketplace appearance and functionality
            </p>
          </div>
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
              >
                {isSubmitting && <Spinner size="sm" color="white" />}
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

      <div className="flex-1 p-4 overflow-auto">
        {tenant && (
          <TenantForm
            initialData={tenant}
            onSubmit={onSubmit}
            onCancel={handleCancelEdit}
            isEditable={isEditing}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  ) : null;
}
