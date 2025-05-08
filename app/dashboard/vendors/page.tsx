"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useVendorStore } from "@/features/vendors/stores/vendor-store";
import { VendorTable } from "@/features/vendors/components/vendor-table";
import { Vendor } from "@/features/vendors/types/vendor";

export default function VendorsPage() {
  const router = useRouter();
  const { vendors, approveVendor, rejectVendor } = useVendorStore();

  const handleVendorClick = (vendor: Vendor) => {
    router.push(`/dashboard/vendors/${vendor.id}`);
  };

  const handleApproveVendor = (vendorId: number, commissionPlan: string, kycVerified: boolean) => {
    approveVendor(vendorId, commissionPlan, kycVerified);
  };

  const handleRejectVendor = (vendorId: number) => {
    rejectVendor(vendorId);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground">
            Manage vendor applications and accounts
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/vendors/add")}>
          Add Vendor
        </Button>
      </div>

      <div className="p-4 space-y-4">
        <VendorTable
          vendors={vendors}
          onVendorClick={handleVendorClick}
          onApproveVendor={handleApproveVendor}
          onRejectVendor={handleRejectVendor}
        />
      </div>
    </div>
  );
}
