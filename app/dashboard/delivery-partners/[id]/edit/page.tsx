"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { use } from "react";

import { Button } from "@/components/ui/button";
import { DeliveryPartnerForm } from "@/features/delivery-partners/components/delivery-partner-form";
import { useDeliveryPartnerStore } from "@/features/delivery-partners/store";

interface DeliveryPartnerEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function DeliveryPartnerEditPage({ params }: DeliveryPartnerEditPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [partner, setPartner] = useState<DeliveryPartner | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchDeliveryPartner } = useDeliveryPartnerStore();

  // Define tenant headers
  const tenantHeaders = {
    "X-Tenant-ID": "4c56d0c3-55d9-495b-ae26-0d922d430a42",
  };
  
  useEffect(() => {
    const loadPartner = async () => {
      try {
        setLoading(true);
        setError(null);
        const partnerData = await fetchDeliveryPartner(id, tenantHeaders);
        setPartner(partnerData);
      } catch (err) {
        console.error('Error fetching delivery partner:', err);
        setError('Failed to load delivery partner details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadPartner();
  }, [id, fetchDeliveryPartner]);

  if (!partner) {
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
              Edit Delivery Partner: {partner.companyName}
            </h1>
            <p className="text-muted-foreground">
              Update delivery partner information and settings
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <DeliveryPartnerForm 
          initialData={partner} 
          disableTypeChange={true}
          onSubmit={(data) => {
            updateDeliveryPartner({
              ...partner,
              ...data,
            });
            router.push("/dashboard/delivery-partners");
          }} 
        />
      </div>
    </div>
  );
}
