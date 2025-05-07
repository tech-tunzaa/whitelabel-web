"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { use } from "react";

import { Button } from "@/components/ui/button";
import { DeliveryPartnerForm } from "@/features/delivery-partners/components/delivery-partner-form";
import { useDeliveryPartnerStore } from "@/features/delivery-partners/stores/delivery-partner-store";

interface DeliveryPartnerEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function DeliveryPartnerEditPage({ params }: DeliveryPartnerEditPageProps) {
  const router = useRouter();
  const { deliveryPartners, updateDeliveryPartner } = useDeliveryPartnerStore();
  const { id } = use(params);
  const deliveryPartner = deliveryPartners.find((dp) => dp._id === id);

  if (!deliveryPartner) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Delivery Partner Not Found</h1>
            <p className="text-muted-foreground">
              The delivery partner you are trying to edit does not exist.
            </p>
          </div>
        </div>
        <div className="p-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/delivery-partners")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Delivery Partners
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
            onClick={() => router.push("/dashboard/delivery-partners")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Edit Delivery Partner: {deliveryPartner.companyName}
            </h1>
            <p className="text-muted-foreground">
              Update delivery partner information and settings
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <DeliveryPartnerForm 
          initialData={deliveryPartner} 
          disableTypeChange={true}
          onSubmit={(data) => {
            updateDeliveryPartner({
              ...deliveryPartner,
              ...data,
            });
            router.push("/dashboard/delivery-partners");
          }} 
        />
      </div>
    </div>
  );
}
