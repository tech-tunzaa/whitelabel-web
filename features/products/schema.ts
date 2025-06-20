import { z } from "zod";

// Product dimensions schema
export const dimensionsSchema = z.object({
  length: z.coerce.number().min(0).optional(),
  width: z.coerce.number().min(0).optional(),
  height: z.coerce.number().min(0).optional(),
});

// Updated Product variant schema
export const variantSchema = z.object({
  _id: z.string().optional(), // For existing variants
  name: z.string().min(1, "Attribute name is required"),
  value: z.string().min(1, "Attribute value is required"),
  price: z.coerce.number().optional(), // Can be positive, negative, or zero
  stock: z.coerce
    .number()
    .int()
    .min(0, "Stock quantity cannot be negative")
    .optional(),
  image_url: z
    .string()
    .url("Image URL must be a valid URL")
    .optional()
    .or(z.literal(""))
    .nullable(), // Optional, can be empty string or null
  sku: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || /^[a-zA-Z0-9-]+$/.test(val), {
      message: "SKU suffix can only contain letters, numbers, and hyphens.",
    }),
});

// Product image schema
export const productImageSchema = z.object({
  url: z.string().url("Must be a valid URL").min(1, "Image URL is required"),
  alt: z.string().optional(),
  is_primary: z.boolean().optional().default(false),
});

// Main product form schema
export const productFormSchema = z
  .object({
    name: z.string().min(2, {
      message: "Product name must be at least 2 characters.",
    }),
    slug: z
      .string()
      .optional()
      .refine((val) => !val || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(val), {
        message:
          "Slug must contain only lowercase letters, numbers, and hyphens",
      }),
    description: z.string().min(10, {
      message: "Description must be at least 10 characters.",
    }),
    short_description: z.string().optional(),
    sku: z.string().min(1, {
      // Base SKU for the product
      message: "Base SKU is required.",
    }),
    barcode: z.string().optional().nullable(),
    category_ids: z.array(z.string()).min(1, {
      message: "At least one category is required.",
    }),
    tags: z.array(z.string()).optional().default([]),
    base_price: z.coerce.number().min(0.01, {
      message: "Price must be greater than 0.",
    }),
    sale_price: z.coerce
      .number()
      .min(0.01, "Sale price must be greater than 0.")
      .optional()
      .nullable(), // Made optional and nullable
    cost_price: z.coerce.number().min(0).optional(),
    inventory_quantity: z.coerce
      .number()
      .int()
      .min(0, {
        // Overall stock if not tracking by variants or if has_variants is false
        message: "Quantity must be a positive integer.",
      })
      .optional(), // Made optional as it might not be relevant if tracking by variant
    inventory_tracking: z.boolean().default(true),
    low_stock_threshold: z.coerce.number().int().min(0).optional(),
    vendor_id: z.string().min(1, {
      message: "Vendor is required.",
    }),
    store_id: z.string(), // Assuming this is always present
    images: z.array(productImageSchema).optional().default([]),
    // has_variants: z.boolean().default(false),
    // variants: z.array(variantSchema).optional().default([]),
    weight: z.coerce.number().min(0).optional(),
    dimensions: dimensionsSchema.optional(),
    requires_shipping: z.boolean().default(true),
    is_active: z.boolean().default(true),
    is_featured: z.boolean().default(false),
    promotion: z.string().nullish(),
    tenant_id: z.string().optional(),
  })
  .refine(
    (data) => {
      // Refinement for variants presence
      if (data.has_variants) {
        return Array.isArray(data.variants) && data.variants.length > 0;
      }
      return true;
    },
    {
      message: "At least one variant must be added when product has variants.",
      path: ["variants"],
    }
  )
  .refine(
    (data) => {
      // Refinement for inventory quantity when not tracking by variants
      if (
        !data.has_variants &&
        data.inventory_tracking &&
        typeof data.inventory_quantity !== "number"
      ) {
        return false; // If not has_variants and tracking inventory, inventory_quantity is required
      }
      return true;
    },
    {
      message:
        "Inventory quantity is required when tracking stock for a product without variants.",
      path: ["inventory_quantity"],
    }
  );

// Export the type
export type ProductFormValues = z.infer<typeof productFormSchema>;
