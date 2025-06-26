import { z } from "zod";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];

export const documentSchema = z.object({
  document_id: z.string().optional(), // Present for existing documents
  document_type: z.string().min(1, "Document type is required"),
  document_url: z.string().url().optional(), // Present for existing documents
  file_name: z.string().optional(), // Present for existing documents, or derived from File object
  file: z.instanceof(File).optional(), // For new uploads
  expires_at: z.string().optional().nullable(),
  verification_status: z.string().optional(),
  rejection_reason: z.string().optional(),
  submitted_at: z.date().optional(),
}).refine(data => data.document_url || data.file, {
  message: "Either a document URL (for existing) or a file (for new) must be present",
  path: ["file"],
}).refine(data => !data.file || data.file.size <= MAX_FILE_SIZE_BYTES, {
  message: `File size should be less than ${MAX_FILE_SIZE_MB}MB`,
  path: ["file"],
}).refine(data => !data.file || ACCEPTED_IMAGE_TYPES.includes(data.file.type), {
  message: "Invalid file type. Accepted: JPG, JPEG, PNG, WEBP, PDF",
  path: ["file"],
});

export const affiliateSchema = z.object({
  name: z.string().min(2, "Affiliate name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number seems too short").regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  bio: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal('')), // Allow empty string or valid URL
  social_media: z.object({
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    facebook: z.string().optional(),
  }).optional(),
  bank_account: z.object({
    bank_name: z.string().min(1, "Bank name is required"),
    account_number: z.string().min(1, "Account number is required"),
    account_name: z.string().min(1, "Account name is required"),
    swift_bic: z.string().optional(),
    branch_code: z.string().optional(),
  }),
  verification_documents: z.array(documentSchema).optional().default([]),
  // Fields like vendor_id, user_id will be handled outside the form schema if they are not direct user inputs
});

export type AffiliateFormValues = z.infer<typeof affiliateSchema>;
