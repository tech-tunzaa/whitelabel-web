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

  const handleCreateVendor = async (data: VendorFormValues) => {
    setIsSubmitting(true);
    try {
      const tenantId = (session?.user as any)?.tenant_id;
      const headers: Record<string, string> = {};
      if (tenantId) {
        headers["X-Tenant-ID"] = tenantId;
      }
      
      // Restructure the form data to ensure branding is set correctly
      const vendorData = {
        ...data,
        store: {
          ...data.store,
          branding: {
            logo_url: data.store.logo_url || "",
            colors: {
              primary: "#4285F4",
              secondary: "#34A853",
              accent: "#FBBC05",
              text: "#333333",
              background: "#FFFFFF"
            }
          }
        }
      };
      
      console.log("Creating vendor with restructured data:", vendorData);
      
      // Create the vendor with the restructured data
      const newVendor = await vendorStore.createVendor(vendorData, headers);
      
      // If we have a new vendor, create the store
      if (newVendor && newVendor.vendor_id) {
        const vendorId = newVendor.vendor_id;
        
        // Prepare store data ensuring branding is included
        const storeData = {
          store_name: data.store.store_name,
          store_slug: data.store.store_slug,
          description: data.store.description,
          banners: Array.isArray(data.store.banners) ? data.store.banners : [],
          categories: Array.isArray(data.store.categories) ? data.store.categories : [],
          return_policy: data.store.return_policy || "",
          shipping_policy: data.store.shipping_policy || "",
          general_policy: data.store.general_policy || "",
          vendor_id: vendorId,
          branding: {
            logo_url: data.store.logo_url || "",
            colors: {
              primary: "#4285F4",
              secondary: "#34A853",
              accent: "#FBBC05",
              text: "#333333",
              background: "#FFFFFF"
            }
          }
        };
        
        try {
          console.log("Creating store for vendor ID:", vendorId, "with data:", storeData);
          
          // Create the store with the vendor ID
          const newStore = await vendorStore.createStore(vendorId, storeData, headers);
          console.log("Store created successfully:", newStore);
          
          toast.success("Vendor and store created successfully");
          router.push(`/dashboard/vendors/${vendorId}`);
        } catch (storeError) {
          console.error("Error creating store:", storeError);
          toast.error("Vendor created, but failed to create store. Please try again from the vendor details page.");
          router.push(`/dashboard/vendors/${vendorId}`);
        }
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
          onSubmit={handleCreateVendor}
          isSubmitting={isSubmitting}
          onCancel={() => router.push('/dashboard/vendors')}
        />
      </div>
    </div>
  );
}
