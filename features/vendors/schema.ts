import { z } from "zod";

// Corresponds to BankAccount type
export const bankAccountSchema = z.object({
  bank_name: z.string().min(1, "Bank name is required"),
  account_number: z.string().min(1, "Account number is required"),
  account_name: z.string().min(1, "Account name is required"),
  swift_code: z.string().optional().nullable(),
  branch_code: z.string().optional().nullable(),
}).optional();

// Corresponds to VerificationDocument type
export const verificationDocumentSchema = z.object({
  document_id: z.string().optional(),
  document_type_id: z.string().optional(),
  document_url: z.string().min(1, "Document URL is required"),
  verification_status: z.enum(["pending", "verified", "rejected"]).optional(),
  rejection_reason: z.string().optional().nullable(),
  submitted_at: z.string().optional(),
  expires_at: z.string().optional().nullable(),
  number: z.string().optional(), // <-- Added document number field
});

// Corresponds to Location type
export const locationSchema = z.object({
  lat: z.number(),
  long: z.number(),
});

// Corresponds to StoreBranding type
export const storeBrandingSchema = z.object({
  logo_url: z.string().optional().nullable(),
  favicon_url: z.string().optional(),
}).optional();

// Corresponds to StoreBanner type
export const storeBannerSchema = z.object({
  title: z.string().min(1, "Banner Title is required"),
  image_url: z.string().min(1, "Banner Image is required"),
  alt_text: z.string().nullable(),
  display_order: z.number(),
});

// Corresponds to Store type
export const storeSchema = z.object({
  store_id: z.string().optional(),
  tenant_id: z.string().optional(),
  vendor_id: z.string().optional(),
  store_name: z.string().min(2, "Store name must be at least 2 characters"),
  description: z.string().optional(),
  branding: storeBrandingSchema,
  banners: z.array(storeBannerSchema).optional(),
  categories: z.array(z.string()).optional(),
  general_policy: z.string().optional().nullable(),
  return_policy: z.string().optional().nullable(),
  shipping_policy: z.string().optional().nullable(),
});

// Corresponds to User type
export const userSchema = z.object({
  user_id: z.string().optional(),
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address").optional(),
  phone_number: z.string().min(10, "Please enter a valid phone number").optional(),

}).optional();


// Main schema for the vendor form, corresponds to VendorFormValues type
export const vendorFormSchema = z.object({
  // Vendor details
  vendor_id: z.string().optional(),
  id: z.string().optional(), // Alias for vendor_id
  tenant_id: z.string().min(1, "Tenant ID is required"),
  user_id: z.string().optional(),
  business_name: z.string().min(2, "Business name must be at least 2 characters"),
  display_name: z.string().min(2, "Display name must be at least 2 characters"),
  policy: z.string().optional(),
  contact_email: z.string().email("Please enter a valid email address"),
  contact_phone: z.string().min(10, "Please enter a valid phone number"),
  website: z.string().url("Website must be a valid URL").or(z.literal("")).optional(),
  address_line1: z.string().min(1, "Address line 1 is required"),
  address_line2: z.string().optional().nullable(),
  city: z.string().min(1, "City is required"),
  state_province: z.string().min(1, "State/Province is required"),
  country: z.string().min(1, "Country is required"),
  tax_id: z.string().optional().nullable(),
  commission_rate: z.string().optional(),
  verification_status: z.string().optional(),
  is_active: z.boolean().optional(),
  policy: z.string().optional().nullable(),
  website: z.string().url("Website must be a valid URL").or(z.literal("")).optional().nullable(),

  // Location can be either tuple from MapPicker or final object form
  location: z.union([
    z.tuple([z.number(), z.number()]), // [lat, long] from MapPicker
    locationSchema, // { lat, long }
  ]).optional().nullable(),

  // Nested objects and arrays
  bank_account: bankAccountSchema,
  verification_documents: z.array(verificationDocumentSchema).optional(),
  stores: z.array(storeSchema).optional(),
  user: userSchema,
});
