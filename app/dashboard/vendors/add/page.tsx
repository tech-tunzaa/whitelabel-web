"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";
import { useVendorStore } from "@/features/vendors/store";
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { VendorFormNew } from "@/features/vendors/components/vendor-form";

export default function VendorAddPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const vendorStore = useVendorStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      // Ensure we have user_id from session or fallback to default
      const vendorData = {
        ...data,
        user_id: session?.user?.id || "13c94ad0-1071-431a-9d59-93eeee25ca0a",
      };

      // Set up headers with X-Tenant-ID for non-superowners
      const headers: Record<string, string> = {};
      const tenantId = (session?.user as any)?.tenant_id;
      if (tenantId) {
        headers["X-Tenant-ID"] = tenantId;
      }

      const newVendor = await vendorStore.createVendor(vendorData, headers);
      toast.success("Vendor created successfully");

      // Navigate to the vendor details page for the newly created vendor
      if (newVendor && (newVendor.id || newVendor._id || newVendor.vendor_id)) {
        router.push(
          `/dashboard/vendors/${
            newVendor.id || newVendor._id || newVendor.vendor_id
          }`
        );
      } else {
        router.push("/dashboard/vendors");
      }
    } catch (error) {
      console.error("Error creating vendor:", error);
      toast.error("Failed to create vendor. Please try again.");
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
        <VendorFormNew
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
