import { z } from "zod";

// Bank account schema
export const bankAccountSchema = z.object({
  bank_name: z.string().min(1, "Bank name is required"),
  account_number: z.string().min(1, "Account number is required"),
  account_name: z.string().min(1, "Account name is required"),
  swift_code: z.string().optional(),
  branch_code: z.string().optional(),
});

// Verification document schema
export const verificationDocumentSchema = z.object({
  document_type: z.string(),
  document_url: z.string().url("Must be a valid URL").optional().nullable(),
  verification_status: z.enum(["pending", "approved", "rejected"]).default("pending").optional(),
  rejection_reason: z.string().optional().nullable(),
  file_name: z.string().optional(),
  expiry_date: z.string().optional().nullable(),
  id: z.string().optional(),
  document_id: z.string().optional(),
});

// Store branding schema
export const brandingSchema = z.object({
  logo_url: z.string().url("Logo URL must be a valid URL").or(z.literal("")),
});

// Store banner schema
export const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  image_url: z.string().url("Image URL must be a valid URL"),
  alt_text: z.string().min(1, "Alt text is required"),
  display_order: z.number().or(z.string().transform(val => parseInt(val, 10))),
  is_active: z.boolean().or(z.string().transform(val => val === "true")),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

// Store schema
export const storeSchema = z.object({
  store_name: z.string().min(2, "Store name must be at least 2 characters"),
  store_slug: z.string().min(2, "Store slug must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  branding: brandingSchema.optional(),
  banners: z.array(bannerSchema).optional().default([]),
  categories: z.array(z.string()).min(0).default([]),
  return_policy: z.string().url("Return policy document must be a valid URL").or(z.literal("")).optional(),
  shipping_policy: z.string().url("Shipping policy document must be a valid URL").or(z.literal("")).optional(),
  general_policy: z.string().url("General policy document must be a valid URL").or(z.literal("")).optional(),
});

// Main vendor form schema
export const vendorFormSchema = z.object({
  // Basic vendor information
  tenant_id: z.string().min(1, "Tenant ID is required"),
  business_name: z.string().min(2, "Business name must be at least 2 characters"),
  display_name: z.string().min(2, "Display name must be at least 2 characters"),
  contact_email: z.string().email("Please enter a valid email address"),
  contact_phone: z.string().min(10, "Please enter a valid phone number"),
  website: z.string().url("Website must be a valid URL").or(z.literal("")).optional(),
  // policy: z.string().url("Policy document must be a valid URL").or(z.literal("")).optional(),

  // Address information
  address_line1: z.string().min(1, "Address line 1 is required"),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state_province: z.string().min(1, "State/Province is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  coordinates: z.tuple([z.number(), z.number()]).nullable().optional(),

  // Business information
  tax_id: z.string().optional(),
  commission_rate: z.string().min(1, "Commission rate is required"),

  // Bank account information
  bank_account: z.object({
    bank_name: z.string().min(1, "Bank name is required"),
    account_number: z.string().min(1, "Account number is required"),
    account_name: z.string().min(1, "Account name is required"),
    swift_bic: z.string().optional(),
    branch_code: z.string().optional(),
  }),

  // Store information
  store: z.object({
    store_name: z.string().min(2, "Store name must be at least 2 characters"),
    store_slug: z.string().min(2, "Store slug must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    logo_url: z.string().url("Logo must be a valid URL").or(z.literal("")).optional().nullable(),
    banners: z.array(
      z.object({
        title: z.string().optional(),
        image_url: z.string().url("Banner image must be a valid URL").or(z.literal("")),
        alt_text: z.string().optional(),
        display_order: z.number().optional(),
        is_active: z.boolean().optional(),
        start_date: z.string().optional(),
        end_date: z.string().optional(),
      })
    ).optional().default([]),
    categories: z.array(z.string()).min(0).default([]),
    return_policy: z.string().url("Return policy document must be a valid URL").or(z.literal("")).optional().nullable(),
    shipping_policy: z.string().url("Shipping policy document must be a valid URL").or(z.literal("")).optional().nullable(),
    general_policy: z.string().url("General policy document must be a valid URL").or(z.literal("")).optional().nullable(),
  }),

  // Verification documents
  verification_documents: z.array(
    z.object({
      document_id: z.string().optional(),
      id: z.string().optional(),
      // document_type: z.string().min(1, "Document type is required"),
      file_name: z.string().optional(),
      file_url: z.string().url("Document must be a valid URL").or(z.literal("")).optional(),
      document_url: z.string().url("Document must be a valid URL").or(z.literal("")).optional(),
      expiry_date: z.string().optional(),
      verification_status: z.enum(["pending", "approved", "rejected"]).optional(),
    })
  ).optional().default([]),

  // User information for account creation
  user: z.object({
    first_name: z.string().min(2, "First name must be at least 2 characters"),
    last_name: z.string().min(2, "Last name must be at least 2 characters"),
    // email: z.string().email("Please enter a valid email address").optional(),
    phone_number: z.string().optional(),
    password: z.string().optional(),
  }).optional(),

  // Fields for existing records
  vendor_id: z.string().optional(),
  id: z.string().optional(),
});

// The type is now imported from types.ts
// This helps maintain a single source of truth for types
