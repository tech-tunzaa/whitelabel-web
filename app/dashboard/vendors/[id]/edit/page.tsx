"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { use } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ErrorCard } from "@/components/ui/error-card";
import { VendorForm } from "@/features/vendors/components/vendor-form";
import { useVendorStore } from "@/features/vendors/store";
import { toast } from "sonner";

interface VendorEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function VendorEditPage({ params }: VendorEditPageProps) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const { vendor, loading, storeError, fetchVendor, updateVendor } = useVendorStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define tenant headers
  const tenantHeaders = {
    'X-Tenant-ID': '4c56d0c3-55d9-495b-ae26-0d922d430a42'
  };

  // Use ref to prevent duplicate API calls
  const fetchRequestRef = useRef(false);
  
  useEffect(() => {
    // Only fetch if not already fetched
    if (!fetchRequestRef.current) {
      fetchRequestRef.current = true;
      fetchVendor(id, tenantHeaders);
    }
  }, [id, fetchVendor]);

  const handleUpdateVendor = async (data: any) => {
    try {
      setIsSubmitting(true);
      await updateVendor(id, data, tenantHeaders);
      toast.success("Vendor updated successfully");
      router.push(`/dashboard/vendors/${id}`);
    } catch (error) {
      console.error("Failed to update vendor:", error);
      toast.error("Failed to update vendor");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Spinner />
    );
  }

  if (!vendor && !loading && storeError) {
    return (
      <ErrorCard 
        title="Failed to load vendor"
        error={storeError}
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
            onClick={() => router.push("/dashboard/vendors")}
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
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <VendorForm 
          initialData={vendor} 
          onSubmit={handleUpdateVendor}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
