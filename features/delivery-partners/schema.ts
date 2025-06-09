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

// Main delivery-partner form schema (mirrors API payload requirements)
export const formKycDocumentSchema = z.object({
  id: z.string().optional(), // ID from API KycDocument if available
  type: z.string(), // Document type, e.g., 'national_id', 'passport'
  number: z.string().optional(), // Document number
  link: z.string().optional(), // URL to the document file
  file: z.any().optional(), // For new File objects (z.instanceof(File) can be used but ensure client-side only)
  status: z.enum(['pending_verification', 'verified', 'rejected', 'uploaded', 'new']).optional(), // Status of the document
  expires_at: z.string().optional().nullable(),
  rejection_reason: z.string().optional().nullable(),
  // Any other fields the DocumentUpload component might need or pass through
});

export const deliveryPartnerFormSchema = z.object({
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
  kyc_documents: z.array(formKycDocumentSchema).optional(),
});

export type DeliveryPartnerFormValues = z.infer<typeof deliveryPartnerFormSchema>;
