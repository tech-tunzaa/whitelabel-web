"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, SaveAllIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { ErrorCard } from "@/components/ui/error-card";
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { VendorForm } from "@/features/vendors/components/vendor-form";
import { useVendorStore } from "@/features/vendors/store";
import { Store } from "@/features/vendors/types";

interface VendorEditPageProps {
  params: {
    id: string;
  };
}

export default function VendorEditPage({ params }: VendorEditPageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const vendorStore = useVendorStore();
  const vendorId = params.id;
  const { vendor, loading, storeError } = vendorStore;
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [storeData, setStoreData] = useState<Store | null>(null);
  
  // Get tenant ID from session for the API header
  const tenantId = (session?.user as any)?.tenant_id;

  useEffect(() => {
    // Fetch vendor data if not already loaded
    if (!fetchAttempted && vendorId) {
      setFetchAttempted(true);
      
      // Set up headers with tenant ID
      const headers: Record<string, string> = {};
      if (tenantId) {
        headers['X-Tenant-ID'] = tenantId;
      }
      
      // Fetch vendor data
      vendorStore.fetchVendor(vendorId, headers)
        .then(() => {
          // Once vendor is fetched, fetch the associated store
          return vendorStore.fetchStoreByVendor(vendorId, headers);
        })
        .then((store) => {
          setStoreData(store);
        })
        .catch((error) => {
          console.error("Error fetching vendor or store:", error);
        });
    }
  }, [vendorId, vendorStore, fetchAttempted, tenantId]);

  const handleSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      // Set up headers with tenant ID
      const headers: Record<string, string> = {};
      if (tenantId) {
        headers['X-Tenant-ID'] = tenantId;
      }
      
      // Log the data being sent to API for vendor update
      console.log("Updating vendor with data:", {
        ...data,
        verification_documents: data.verification_documents?.map(doc => ({
          document_type: doc.document_type,
          document_url: doc.document_url,
          document_id: doc.document_id || doc.id,
          file_name: doc.file_name,
          expires_at: doc.expires_at || doc.expiry_date
        }))
      });
      
      // First update the vendor
      await vendorStore.updateVendor(vendorId, data, headers);
      
      // If we have store data and it was included in the form submission, update the store too
      if (data.store) {
        try {
          // Prepare store data ensuring all required fields are included
          const storeUpdateData = {
            store_name: data.store.store_name,
            store_slug: data.store.store_slug,
            description: data.store.description,
            logo_url: data.store.logo_url || "",
            banners: Array.isArray(data.store.banners) ? data.store.banners : []
          };
          
          console.log(`Updating store for vendor ID: ${vendorId}, store ID: ${storeData?.id || 'new'} with data:`, storeUpdateData);
          
          if (storeData && storeData.id) {
            // Update existing store
            await vendorStore.updateStore(
              vendorId,
              storeData.id,
              storeUpdateData,
              headers
            );
            toast.success("Vendor and store updated successfully");
          } else {
            // Create new store if it doesn't exist
            await vendorStore.createStore(vendorId, storeUpdateData, headers);
            toast.success("Vendor updated and new store created successfully");
            
            // Refresh store data
            const updatedStore = await vendorStore.fetchStoreByVendor(vendorId, headers);
            setStoreData(updatedStore);
          }
        } catch (storeError) {
          console.error("Error updating/creating store:", storeError);
          toast.error("Vendor updated, but failed to update/create store.");
        }
      } else {
        toast.success("Vendor updated successfully");
      }
    } catch (error) {
      console.error("Error updating vendor:", error);
      toast.error("Failed to update vendor. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while fetching
  if (loading && !isSubmitting && !vendor) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Show error state if vendor fetch failed
  if (!loading && !vendor && storeError) {
    return (
      <ErrorCard
        title="Failed to load vendor"
        error={{
          status: storeError.status?.toString() || "Error",
          message: storeError.message || "Failed to load vendor"
        }}
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
              Edit Vendor: {vendor?.business_name}
            </h1>
            <p className="text-muted-foreground">
              Update vendor information and settings
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
              <div className="mr-2"><Spinner size="sm" color="white" /></div>
              Updating...
            </>
          ) : (
            <>Save Changes</>
          )}
        </Button>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <VendorForm
          onSubmit={handleSubmit}
          initialData={vendor as any}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
