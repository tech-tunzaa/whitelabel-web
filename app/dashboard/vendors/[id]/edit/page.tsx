"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { use } from "react";

import { Button } from "@/components/ui/button";
import { VendorForm } from "@/features/vendors/components/vendor-form";
import { useVendorStore } from "@/features/vendors/stores/vendor-store";

interface VendorEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function VendorEditPage({ params }: VendorEditPageProps) {
  const router = useRouter();
  const { vendors, updateVendor } = useVendorStore();
  const { id } = use(params);
  const vendor = vendors.find((v) => v.id === parseInt(id));

  if (!vendor) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Vendor Not Found</h1>
            <p className="text-muted-foreground">
              The vendor you are trying to edit does not exist.
            </p>
          </div>
        </div>
        <div className="p-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/vendors")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vendors
          </Button>
        </div>
      </div>
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
              Edit Vendor: {vendor.businessName}
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
          onSubmit={(data) => {
            updateVendor({
              ...vendor,
              ...data,
            });
            router.push("/dashboard/vendors");
          }} 
        />
      </div>
    </div>
  );
}
