"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVendorStore } from "@/features/vendors/store";
import { VendorForm } from "@/features/vendors/components/vendor-form";
import { Vendor } from "@/features/vendors/types";

export default function AddVendorPage() {
  const router = useRouter();
  const { addVendor } = useVendorStore();

  const handleSubmit = (data: any) => {
    const newVendor: Vendor = {
      id: Date.now(),
      businessName: data.businessName,
      email: data.email,
      phone: data.phone,
      logo: "/placeholder.svg",
      category: data.category,
      status: "pending",
      registrationDate: new Date().toISOString().split("T")[0],
      taxId: data.taxId,
      address: {
        street: data.street,
        city: data.city,
        state: data.state,
        zip: data.zip,
        country: data.country,
      },
      description: data.description,
      documents: {
        identity: [],
        business: [],
        bank: [],
      },
    };
    addVendor(newVendor);
    router.push("/dashboard/vendors");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 border-b">
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
          <h1 className="text-2xl font-bold tracking-tight">Add Vendor</h1>
          <p className="text-muted-foreground">Create a new vendor account</p>
        </div>
      </div>

      <div className="p-4">
        <VendorForm onSubmit={handleSubmit} onCancel={() => router.push("/dashboard/vendors")} />
      </div>
    </div>
  );
}
