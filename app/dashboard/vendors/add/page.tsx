"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";
import { useVendorStore } from "@/features/vendors/store";
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { VendorForm } from "@/features/vendors/components/vendor-form";
import { Vendor, VendorFormValues } from "@/features/vendors/types";

export default function VendorAddPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const vendorStore = useVendorStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: VendorFormValues): Promise<Vendor | undefined> => {
    setIsSubmitting(true);
    try {
      // Set up headers with X-Tenant-ID for non-superowners
      const headers: Record<string, string> = {};
      const tenantId = (session?.user as any)?.tenant_id;
      if (tenantId) {
        headers["X-Tenant-ID"] = tenantId;
      }

      // First create the vendor
      const newVendor = await vendorStore.createVendor(data, headers);
      
      if (newVendor && newVendor.vendor_id) {
        const vendorId = newVendor.vendor_id;
        
        try {
          // Immediately create the store with the vendor ID
          await vendorStore.createStore(vendorId, {
            store_name: data.store.store_name,
            store_slug: data.store.store_slug,
            description: data.store.description,
            logo_url: data.store.logo_url,
            banners: data.store.banners,
          }, headers);
          
          toast.success("Vendor and store created successfully");
        } catch (storeError) {
          console.error("Error creating store:", storeError);
          toast.error("Vendor created, but failed to create store. Please try again from the vendor details page.");
        }
        
        // Navigate to the vendor details page
        router.push(`/dashboard/vendors/${vendorId}`);
      } else {
        router.push("/dashboard/vendors");
        toast.success("Vendor created successfully");
      }
      
      return newVendor;
    } catch (error) {
      console.error("Error creating vendor:", error);
      toast.error("Failed to create vendor. Please try again.");
      return undefined;
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
            onClick={() => router.push("/dashboard/vendors")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Add New Vendor
            </h1>
            <p className="text-muted-foreground">
              Create a new vendor account and store
            </p>
          </div>
        </div>
        <Button 
          type="submit"
          form="marketplace-vendor-form"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" color="white" />
              Creating...
            </>
          ) : (
            <>Save Vendor</>
          )}
        </Button>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <VendorForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
