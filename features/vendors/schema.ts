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
  document_type: z.string().min(1, "Document type is required"),
  document_url: z.string().url("Must be a valid URL"),
  verification_status: z.enum(["pending", "approved", "rejected"]).default("pending"),
  rejection_reason: z.string().optional(),
});

// Store branding schema
export const brandingSchema = z.object({
  logo_url: z.string().url("Logo URL must be a valid URL").or(z.literal("")),
  favicon_url: z.string().url("Favicon URL must be a valid URL").or(z.literal("")).optional(),
  colors: z.object({
    primary: z.string().min(1, "Primary color is required"),
    secondary: z.string().min(1, "Secondary color is required"),
    accent: z.string().min(1, "Accent color is required"),
    text: z.string().min(1, "Text color is required"),
    background: z.string().min(1, "Background color is required"),
  }),
  font_family: z.string().optional(),
  slogan: z.string().optional(),
  about_html: z.string().optional(),
  facebook_url: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  instagram_handle: z.string().optional(),
  twitter_handle: z.string().optional(),
  youtube_url: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
});

// Store banner schema
export const bannerSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  image_url: z.string().url("Image URL must be a valid URL"),
  mobile_image_url: z.string().url("Mobile image URL must be a valid URL").optional(),
  destination_url: z.string().url("Destination URL must be a valid URL").optional(),
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
  description: z.string().min(10, "Description must be at least 10 characters"),
  branding: brandingSchema,
  banners: z.array(bannerSchema).optional(),
});

// Main vendor form schema
export const vendorFormSchema = z.object({
  // Basic vendor information
  business_name: z.string().min(2, "Business name must be at least 2 characters"),
  display_name: z.string().min(2, "Display name must be at least 2 characters"),
  contact_email: z.string().email("Please enter a valid email address"),
  contact_phone: z.string().min(10, "Please enter a valid phone number"),
  website: z.string().url("Website must be a valid URL").or(z.literal("")).optional(),
  
  // Address information
  address_line1: z.string().min(1, "Address line 1 is required"),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state_province: z.string().min(1, "State/Province is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  
  // Business details
  tax_id: z.string().min(1, "Tax ID is required"),
  bank_account: bankAccountSchema,
  
  // Store details
  store: storeSchema,
  
  // Optional fields
  commission_rate: z.string().optional(),
  verification_documents: z.array(verificationDocumentSchema).optional(),
});

// The type is now imported from types.ts
// This helps maintain a single source of truth for types
