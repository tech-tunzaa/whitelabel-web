import { z } from "zod";

// Define schemas
export const brandingSchema = z.object({
  logoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  theme: z.object({
    logo: z.object({
      primary: z.string().url("Invalid URL").optional().or(z.literal("")),
      secondary: z.string().url("Invalid URL").optional().or(z.literal("")),
      icon: z.string().url("Invalid URL").optional().or(z.literal("")),
    }),
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
    })
  }),
});

export const modulesSchema = z.object({
  key: z.string().optional(),
  value: z.boolean().optional(),
});

export const revenueSchema = z.object({
  total_revenue: z.string().optional(),
  commission_rate: z.string().min(1, {
    message: "Commission rate is required",
  }),
  platform_fee: z.string().min(1, {
    message: "Platform fee is required",
  }),
});

export const tenantFormSchema = z.object({
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
  document_types: z.array(z.string()).min(1, {
    message: "At least one document type is required.",
  }),
  vehicle_types: z.array(z.string()).min(1, {
    message: "At least one vehicle type is required.",
  }),
  fee: z.string().optional().or(z.literal("")),
  trial_ends_at: z.string().optional().or(z.literal("")),
  is_active: z.boolean().optional(),
  modules: modulesSchema,
  branding: brandingSchema,
});
// Workaround for schemas that should be optional in some contexts
// Use this in the component conditional validation

export type TenantFormValues = z.infer<typeof tenantFormSchema>;
