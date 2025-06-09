"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DeliveryPartnerForm } from "@/features/delivery-partners/components/delivery-partner-form";
import { useDeliveryPartnerStore } from "@/features/delivery-partners/store";
import { DeliveryPartner, VehicleInfo, KycDocument } from "@/features/delivery-partners/types"; // Added KycDocument
import { DeliveryPartnerFormValues, formKycDocumentSchema } from "@/features/delivery-partners/schema"; // Added FormValues type and formKycDocumentSchema
import { z } from "zod"; // For inferring FormKycDocumentValues type
import toast from "@/components/ui/sonner";

interface DeliveryPartnerEditPageProps {
  params: {
    id: string;
  };
}

type FormKycDocumentValues = z.infer<typeof formKycDocumentSchema>;

const transformPartnerDataToFormValues = (partner: DeliveryPartner): Partial<DeliveryPartnerFormValues> => {
  const formValues: Partial<DeliveryPartnerFormValues> = {
    type: partner.type,
    name: partner.name, // Partner's main name (individual's full name or business name)
    user: partner.user ? {
      first_name: partner.user.first_name || "",
      last_name: partner.user.last_name || "",
      email: partner.user.email || "",
      phone_number: partner.user.phone_number || "",
    } : { first_name: "", last_name: "", email: "", phone_number: "" },
    profile_picture: partner.profile_picture || null,
    description: partner.description || null,
    tax_id: partner.tax_id || undefined,
  };

  if (partner.location?.coordinates) {
    formValues.coordinates = [partner.location.coordinates.lat, partner.location.coordinates.lng];
  }

  if (partner.type === 'individual') {
    if (partner.vehicle_info) {
      formValues.vehicleType = partner.vehicle_info.type;
      formValues.plateNumber = partner.vehicle_info.plate_number;
      if (partner.vehicle_info.details && Array.isArray(partner.vehicle_info.details)) {
        partner.vehicle_info.details.forEach(detail => {
          if (detail.key.toLowerCase() === 'make') formValues.vehicleMake = detail.value;
          if (detail.key.toLowerCase() === 'model') formValues.vehicleModel = detail.value;
          if (detail.key.toLowerCase() === 'year') formValues.vehicleYear = detail.value;
        });
      }
    }
    if (partner.cost_per_km !== undefined && partner.cost_per_km !== null) {
      formValues.cost_per_km = String(partner.cost_per_km);
    }
  }

  if (partner.type === 'pickup_point') {
    if (partner.flat_fee !== undefined && partner.flat_fee !== null) {
      formValues.flat_fee = String(partner.flat_fee);
    }
  }

  if (partner.type === 'business' && partner.drivers) {
    // The form expects an array of driver objects. API provides string[].
    // For editing, this might mean fetching full driver details or handling it in a sub-component.
    // For now, we'll pass an empty array to avoid type errors if full objects aren't readily available.
    // formValues.drivers = []; // Or map if you have full driver objects
  }

  if (partner.kyc && partner.kyc.documents && Array.isArray(partner.kyc.documents)) {
    formValues.kyc_documents = partner.kyc.documents.map((doc: KycDocument): FormKycDocumentValues => {
      let status: FormKycDocumentValues['status'] = 'pending_verification';
      if (doc.verified) {
        status = 'verified';
      } else if (doc.rejected_at) {
        status = 'rejected';
      }
      // If there's a link, it implies it was uploaded previously.
      // 'uploaded' could be an initial status if not yet verified/rejected.
      // For simplicity, we'll use pending_verification if not verified/rejected.

      return {
        // Assuming API KycDocument does not have a distinct 'id'. If it does, map it here.
        // For keying in React lists, a unique property like 'link' or index might be used if no id.
        type: doc.type,
        number: doc.number || undefined,
        link: doc.link || undefined,
        status: status,
        expires_at: doc.expires_at || null,
        rejection_reason: doc.rejected_reason || null,
        // 'file' field will be undefined for existing documents from API
      };
    });
  } else {
    formValues.kyc_documents = [];
  }

  return formValues;
};

const transformFormValuesToApiPayload = (formValues: DeliveryPartnerFormValues, partner?: DeliveryPartner | null): Partial<DeliveryPartner> => {
  const apiPayload: Partial<DeliveryPartner> = {
    type: formValues.type,
    name: formValues.name, // Assuming form provides the correct partner name
    user: formValues.user, // Assuming form user structure matches API
    profile_picture: formValues.profile_picture,
    description: formValues.description,
    tax_id: formValues.tax_id,
  };

  if (formValues.coordinates && formValues.coordinates.length === 2) {
    apiPayload.location = { 
      coordinates: { 
        lat: formValues.coordinates[0],
        lng: formValues.coordinates[1]
      }
    };
  }

  if (formValues.type === 'individual') {
    apiPayload.vehicle_info = {
      type: formValues.vehicleType || '',
      plate_number: formValues.plateNumber || '',
      details: [
        // Reconstruct details array if needed, or adjust API to accept flat vehicle fields
        // For simplicity, if vehicleMake, Model, Year are top-level in API's vehicle_info, map them directly
        // This example assumes they are part of a 'details' array in vehicle_info, which might not be the case for update.
        // If API expects flat vehicle_info fields: vehicle_make: formValues.vehicleMake, etc.
      ].filter(detail => detail.value) // Filter out empty details
    };
    if (formValues.vehicleMake) apiPayload.vehicle_info.details?.push({key: 'make', value: formValues.vehicleMake});
    if (formValues.vehicleModel) apiPayload.vehicle_info.details?.push({key: 'model', value: formValues.vehicleModel});
    if (formValues.vehicleYear) apiPayload.vehicle_info.details?.push({key: 'year', value: formValues.vehicleYear});

    if (formValues.cost_per_km !== undefined && formValues.cost_per_km !== null && formValues.cost_per_km !== '') {
      apiPayload.cost_per_km = parseFloat(formValues.cost_per_km);
    }
  }

  if (formValues.type === 'pickup_point') {
    if (formValues.flat_fee !== undefined && formValues.flat_fee !== null && formValues.flat_fee !== '') {
      apiPayload.flat_fee = parseFloat(formValues.flat_fee);
    }
  }

  // Handle 'drivers' for business type if formValues.drivers is populated
  // This would involve mapping formValues.drivers (array of driver objects) to API's expected structure (e.g., array of driver IDs or full objects)

  if (formValues.kyc_documents && Array.isArray(formValues.kyc_documents)) {
    // This transformation assumes the API expects a list of document metadata.
    // Actual file uploads for new documents (where formValues.kyc_documents[i].file exists)
    // would typically be handled by the form component itself, possibly making separate API calls.
    // The payload here would then include URLs/IDs of newly uploaded files.
    // For simplicity, we're mapping metadata. If a 'file' object is present, it's ignored in this specific transformation
    // as the main partner update API usually doesn't take raw file binaries in JSON.
    apiPayload.kyc = { 
      ...(partner?.kyc || {}), // Preserve other kyc fields if any, like top-level 'verified'
      documents: formValues.kyc_documents.map((doc: FormKycDocumentValues): Partial<KycDocument> => {
        const apiDoc: Partial<KycDocument> = {
          type: doc.type,
          number: doc.number,
          link: doc.link, // Link to existing or newly uploaded file
          expires_at: doc.expires_at,
          // The API might infer 'verified' or 'rejected_at' based on separate actions or workflow.
          // Or, if status is directly updatable via this payload, map doc.status back to API fields.
          // For now, we're primarily sending descriptive data.
        };
        // If your API expects an ID for existing documents to update them:
        // if (doc.id) apiDoc._id = doc.id; // Assuming API uses _id for documents
        return apiDoc;
      })
    };
  }

  return apiPayload;
};

export default function DeliveryPartnerEditPage({ params }: DeliveryPartnerEditPageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const id = params.id;
  const [partner, setPartner] = useState<DeliveryPartner | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // This can be used for displaying general page errors
  const { fetchDeliveryPartner, updateDeliveryPartner } = useDeliveryPartnerStore();

  useEffect(() => {
    const loadPartner = async () => {
      try {
        setLoading(true);
        setError(null);
        const tenantId = (session?.user as any)?.tenant_id;
        const headers: Record<string, string> = {};
        if (tenantId) {
          headers["X-Tenant-ID"] = tenantId;
        }
        const partnerData = await fetchDeliveryPartner(id, headers);
        setPartner(partnerData);
      } catch (err: any) {
        console.error('Error fetching delivery partner:', err);
        toast.error(err.message || 'Failed to load delivery partner details. Please try again.');
        setError('Failed to load delivery partner details.'); // Set page level error if needed
      } finally {
        setLoading(false);
      }
    };

    loadPartner();
  }, [id, fetchDeliveryPartner]);

  const handleSubmit = async (data: DeliveryPartnerFormValues) => {
    try {
      setLoading(true);
      const tenantId = (session?.user as any)?.tenant_id;
      const headers: Record<string, string> = {};
      if (tenantId) {
        headers["X-Tenant-ID"] = tenantId;
      }

      const apiPayload = transformFormValuesToApiPayload(data as DeliveryPartnerFormValues, partner);
      await updateDeliveryPartner(id, apiPayload, headers);
      toast.success("Delivery Partner updated successfully");
      router.push("/dashboard/delivery-partners");
    } catch (err: any) {
      console.error('Error updating delivery partner:', err);
      toast.error(err.message || 'Failed to update delivery partner. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          initialData={partner ? transformPartnerDataToFormValues(partner) : undefined}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/dashboard/delivery-partners")}
          disableTypeChange={true}
        />
      </div>
    </div>
  );
}
