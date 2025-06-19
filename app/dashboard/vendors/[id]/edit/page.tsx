"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { ErrorCard } from "@/components/ui/error-card";
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { VendorForm } from "@/features/vendors/components/vendor-form";
import { useVendorStore } from "@/features/vendors/store";
import { VendorFormValues, Vendor } from "@/features/vendors/types";

interface VendorEditPageProps {
  params: {
    id: string;
  };
}

export default function VendorEditPage({ params }: VendorEditPageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { 
    vendor, 
    loading, 
    error: storeError, 
    fetchVendor, 
    updateVendor 
  } = useVendorStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const vendorId = params.id;
  const tenantId = (session?.user as any)?.tenant_id;

  useEffect(() => {
    if (vendorId) {
      const headers = tenantId ? { 'x-tenant-id': tenantId } : {};
      fetchVendor(vendorId, headers);
    }
  }, [vendorId, tenantId, fetchVendor]);

  const handleSubmit = async (data: VendorFormValues) => {
    setIsSubmitting(true);
    try {
      const headers = tenantId ? { 'X-Tenant-ID': tenantId } : {};
      await updateVendor(vendorId, data, headers);
      toast.success("Vendor updated successfully!");
      router.push(`/dashboard/vendors/${vendorId}`);
    } catch (apiError) {
      const errorMessage = apiError instanceof Error ? apiError.message : "An unknown error occurred";
      toast.error(`Failed to update vendor: ${errorMessage}`);
      console.error("Update vendor error:", apiError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !vendor) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (storeError) {
    return (
      <ErrorCard
        title="Failed to load vendor"
        error={{
          status: storeError.status?.toString() || "Error",
          message: storeError.message || "An unexpected error occurred."
        }}
        buttonText="Back to Vendors"
        buttonAction={() => router.push("/dashboard/vendors")}
        buttonIcon={ArrowLeft}
      />
    );
  }

  if (!vendor) {
    return (
      <ErrorCard
        title="Vendor Not Found"
        error={{ status: "404", message: "This vendor could not be found." }}
        buttonText="Back to Vendors"
        buttonAction={() => router.push("/dashboard/vendors")}
        buttonIcon={ArrowLeft}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/dashboard/vendors/${vendorId}`)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Edit Vendor: {vendor.business_name}
            </h1>
            <p className="text-muted-foreground">
              Update vendor information and settings
            </p>
          </div>
        </div>
        <Button 
          type="submit" 
          form="marketplace-vendor-form" 
          disabled={isSubmitting || loading}
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Updating...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <VendorForm
          onSubmit={handleSubmit}
          initialData={vendor as VendorFormValues}
          isSubmitting={isSubmitting}
          onCancel={() => router.push(`/dashboard/vendors/${vendorId}`)}
        />
      </div>
    </div>
  );
}
