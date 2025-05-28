"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { WingaForm } from "@/features/vendors/winga/components";

export default function AddWingaPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Vendor Affiliate</h1>
          <p className="text-muted-foreground">
            Create a new affiliate for a vendor
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="p-4">
        <WingaForm />
      </div>
    </div>
  );
}
