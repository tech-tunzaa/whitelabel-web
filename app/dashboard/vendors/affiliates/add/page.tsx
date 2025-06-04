"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AffiliateForm } from "@/features/vendors/affiliates/components";

export default function AddAffiliatePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 border-b">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Add Vendor Affiliate
          </h1>
          <p className="text-muted-foreground">
            Create a new affiliate for a vendor
          </p>
        </div>
      </div>

      <div className="p-4">
        <AffiliateForm />
      </div>
    </div>
  );
}
