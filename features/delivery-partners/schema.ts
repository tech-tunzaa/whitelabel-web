import { z } from "zod";

// Schema for individual driver information (used within businesses)
export const driverSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  licenseNumber: z.string().optional(),
  vehicleType: z.string().optional(),
  plateNumber: z.string().optional(),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.string().optional(),
  cost_per_km: z.string().optional(),
});

export const vehicleMetadataSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.union([z.string(), z.number()]).optional(),
  color: z.string().optional(),
  plate: z.string().optional(),
});

export const formKycDocumentSchema = z.object({
  id: z.string().optional(),
  document_type_id: z.string(),
  number: z.string(),
  link: z.string().optional(),
  file: z.any().optional(),
  status: z.enum(['pending_verification', 'verified', 'rejected', 'uploaded', 'new']).optional(),
  expires_at: z.string().optional(), // always present, can be undefined
  rejection_reason: z.string().optional().nullable(),
});

export const deliveryPartnerFormSchema = z.object({
  _id: z.string().optional(),
  type: z.enum(["individual", "business", "pickup_point"], {
    required_error: "Please select a delivery partner type",
  }),
  ...driverSchema.shape,
  name: z.string().optional(),
  user: z.object({
    first_name: z.string().min(2, "First name must be at least 2 characters"),
    last_name: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone_number: z.string().min(10, "Please enter a valid phone number"),
  }),
  profile_picture: z.string().optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  flat_fee: z.string().optional(),
  tax_id: z.string().optional(),
  drivers: z.array(driverSchema).optional(),
  coordinates: z.tuple([z.number(), z.number()]).optional(),
  vehicle_type_id: z.string().optional(),
  vehicle_metadata: vehicleMetadataSchema.optional(),
  kyc_documents: z.array(formKycDocumentSchema).optional(),
  vehiclePlate: z.string().optional(),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.string().optional(),
  vehicleColor: z.string().optional(),
});

export type DeliveryPartnerFormValues = z.infer<typeof deliveryPartnerFormSchema>;
