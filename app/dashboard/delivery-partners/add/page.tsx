"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDeliveryPartnerStore } from "@/features/delivery-partners/store"
import { DeliveryPartnerForm } from "@/features/delivery-partners/components/delivery-partner-form"
import { DeliveryPartner } from "@/features/delivery-partners/types"
import toast from "@/components/ui/sonner";
import { DeliveryPartnerFormValues } from "@/features/delivery-partners/schema";
import { KycDocument } from "@/features/delivery-partners/types";

const transformFormValuesToApiPayload = (formValues: DeliveryPartnerFormValues): Partial<DeliveryPartner> => {
  const apiPayload: Partial<DeliveryPartner> = {
    type: formValues.type,
    name: formValues.name,
    user: formValues.user,
    profile_picture: formValues.profile_picture,
    description: formValues.description,
    tax_id: formValues.tax_id,
  };

  apiPayload.commission_percent = 15.0;

  if (formValues.coordinates && formValues.coordinates.length === 2) {
    apiPayload.location = {
      coordinates: {
        lat: formValues.coordinates[0],
        lng: formValues.coordinates[1],
      },
      radiusKm: 10.5,
    };
  }

  if (formValues.type === "individual") {
    apiPayload.vehicle_info = {
      type: formValues.vehicleType || "",
      plate_number: formValues.plateNumber || "",
      details: [],
    };
    if (formValues.vehicleMake)
      apiPayload.vehicle_info.details?.push({
        key: "make",
        value: formValues.vehicleMake,
      });
    if (formValues.vehicleModel)
      apiPayload.vehicle_info.details?.push({
        key: "model",
        value: formValues.vehicleModel,
      });
    if (formValues.vehicleYear)
      apiPayload.vehicle_info.details?.push({
        key: "year",
        value: formValues.vehicleYear,
      });

    if (
      formValues.cost_per_km !== undefined &&
      formValues.cost_per_km !== null &&
      formValues.cost_per_km !== ""
    ) {
      apiPayload.cost_per_km = parseFloat(formValues.cost_per_km);
    }
  }

  if (formValues.type === "pickup_point") {
    if (
      formValues.flat_fee !== undefined &&
      formValues.flat_fee !== null &&
      formValues.flat_fee !== ""
    ) {
      apiPayload.flat_fee = parseFloat(formValues.flat_fee);
    }
  }

  if (formValues.kyc_documents && Array.isArray(formValues.kyc_documents)) {
    apiPayload.kyc = {
      documents: formValues.kyc_documents as Partial<KycDocument>[],
    };
  }

  return apiPayload;
};

export default function CreateDeliveryPartnerPage() {
    const router = useRouter()
    const { data: session } = useSession();

    const { createDeliveryPartner } = useDeliveryPartnerStore()

    const handleSubmit = async (data: DeliveryPartnerFormValues) => {
        const apiPayload = transformFormValuesToApiPayload(data);
        const tenantId = (session?.user as any)?.tenant_id;
        const headers: Record<string, string> = {};
        if (tenantId) {
          headers["X-Tenant-ID"] = tenantId;
        }

        try {
            await createDeliveryPartner(apiPayload, headers);
            toast.success("Delivery Partner created successfully");
            router.push("/dashboard/delivery-partners");
        } catch (error) {
            console.error("Error creating delivery partner:", error);
            toast.error("Failed to create delivery partner. Please try again.");
        }
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center p-4 border-b">
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
                    <h1 className="text-2xl font-bold tracking-tight">Add Delivery Partner</h1>
                    <p className="text-muted-foreground">
                        Create a new delivery partner account
                    </p>
                </div>
            </div>

            <div className="p-4">
                <DeliveryPartnerForm
                    onSubmit={handleSubmit}
                    onCancel={() => router.push("/dashboard/delivery-partners")}
                />
            </div>
        </div>
    )
} 