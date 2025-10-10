import { z } from "zod";

// Define schemas
export const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  image_url: z.string().url("Invalid URL"),
  alt_text: z.string().optional(),
  display_order: z.number(),
});

export const brandingSchema = z.object({
  logoUrl: z.string().url("Invalid URL").optional().or(z.literal("")).nullable(),
  theme: z.object({
    logo: z.object({
      primary: z.string().url("Invalid URL").optional().or(z.literal("")).nullable(),
      secondary: z.string().url("Invalid URL").optional().or(z.literal("")).nullable(),
      icon: z.string().url("Invalid URL").optional().or(z.literal("")).nullable(),
    }).optional().nullable(),
    colors: z.object({
      primary: z.string().regex(/^#[0-9A-F]{6}$/i, {
        message: "Please enter a valid hex color code.",
      }),
      secondary: z.string().regex(/^#[0-9A-F]{6}$/i, {
        message: "Please enter a valid hex color code.",
      }),
      accent: z.string().regex(/^#[0-9A-F]{6}$/i, {
        message: "Please enter a valid hex color code.",
      }),
      text: z.object({
        primary: z.string().regex(/^#[0-9A-F]{6}$/i, {
          message: "Please enter a valid hex color code.",
        }),
        secondary: z.string().regex(/^#[0-9A-F]{6}$/i, {
          message: "Please enter a valid hex color code.",
        }),
      }),
      background: z.object({
        primary: z.string().regex(/^#[0-9A-F]{6}$/i, {
          message: "Please enter a valid hex color code.",
        }),
        secondary: z.string().regex(/^#[0-9A-F]{6}$/i, {
          message: "Please enter a valid hex color code.",
        }),
      }),
      border: z.string().regex(/^#[0-9A-F]{6}$/i, {
        message: "Please enter a valid hex color code.",
      }),
    }),
  }),
});

export const modulesSchema = z.record(z.boolean()).optional().nullable();

export const metadataSchema = z.object({
  terms_conditions: z.string().url("Invalid URL").optional().nullable(),
  privacy_policy: z.string().url("Invalid URL").optional().nullable(),
  banners: z.array(bannerSchema).optional().nullable(),
}).optional().nullable();

export const billingConfigSchema = z.object({
  flat_rate_amount: z.number().min(0, "Amount must be a positive number"),
  currency: z.string().min(1, "Currency is required"),
  billing_frequency: z.enum(["monthly", "quarterly", "annually"], {
    required_error: "Please select a billing frequency.",
  }),
  billing_email: z.string().email("Please enter a valid email address"),
  auto_generate_invoices: z.boolean().default(true),
  email_notifications: z.boolean().default(true),
  billing_day_of_month: z.number().min(1).max(31, "Day must be between 1 and 31"),
  payment_due_days: z.number().min(1, "Payment due days must be at least 1"),
  is_active: z.boolean().default(true),
}).optional().nullable();

export const tenantFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  name: z.string().min(2, {
    message: "Tenant name is required",
  }),
  domain: z.string().min(2, {
    message: "Domain is required",
  }),
  admin_email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  admin_phone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  plan: z.enum(["monthly", "quarterly", "annually"], {
    required_error: "Please select a subscription plan.",
  }),
  country_code: z.string().min(1, {
    message: "Country is required.",
  }),
  currency: z.string().min(1, {
    message: "Currency is required.",
  }),
  languages: z.array(z.string()).min(1, {
    message: "At least one language is required.",
  }),
  fee: z.string().optional().or(z.literal("")),
  trial_ends_at: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
  modules: modulesSchema,
  branding: brandingSchema.optional().nullable(),
  banners: z.array(bannerSchema).optional().nullable(),
  metadata: metadataSchema,
  billing_config: billingConfigSchema,
});

export type TenantFormValues = z.infer<typeof tenantFormSchema>;