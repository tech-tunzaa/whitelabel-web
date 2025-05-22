import { z } from "zod";

// Product dimensions schema
export const dimensionsSchema = z.object({
    length: z.coerce.number().min(0).optional(),
    width: z.coerce.number().min(0).optional(),
    height: z.coerce.number().min(0).optional(),
});

// Product variant schema
const variantSchema = z.object({
    sku: z.string().min(1, "Variant SKU is required"),
    name: z.string().min(1, "Variant name is required"),
    price: z.string().nullable(),
    attributes: z.object({
        name: z.string().optional(),
        value: z.string().optional()
    }).refine(obj => Object.values(obj).some(val => !!val), {
        message: "At least one attribute must be provided"
    })
});

// Product image schema
export const productImageSchema = z.object({
    url: z.string().url("Must be a valid URL").min(1, "Image URL is required"),
    alt: z.string().optional(),
    is_primary: z.boolean().optional().default(false),
});

// Main product form schema
export const productFormSchema = z.object({
    name: z.string().min(2, {
        message: "Product name must be at least 2 characters.",
    }),
    slug: z.string().optional()
        .refine(val => !val || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(val), {
            message: "Slug must contain only lowercase letters, numbers, and hyphens"
        }),
    description: z.string().min(10, {
        message: "Description must be at least 10 characters.",
    }),
    short_description: z.string().optional(),
    sku: z.string().min(1, {
        message: "SKU is required.",
    }),
    barcode: z.string().optional().nullable(),
    category_ids: z.array(z.string()).min(1, {
        message: "At least one category is required."
    }),
    tags: z.array(z.string()).optional().default([]),
    base_price: z.coerce.number().min(0.01, {
        message: "Price must be greater than 0.",
    }),
    sale_price: z.coerce.number().min(0.01, {
        message: "Sale price must be greater than 0.",
    }),
    cost_price: z.coerce.number().min(0).optional(),
    inventory_quantity: z.coerce.number().int().min(0, {
        message: "Quantity must be a positive integer.",
    }),
    inventory_tracking: z.boolean().default(true),
    low_stock_threshold: z.coerce.number().int().min(0).optional(),
    vendor_id: z.string().min(1, {
        message: "Vendor is required.",
    }),
    store_id: z.string(),
    images: z.array(productImageSchema).optional().default([]),
    has_variants: z.boolean().default(false),
    variants: z.array(variantSchema).optional().default([]),
    weight: z.coerce.number().min(0).optional(),
    dimensions: dimensionsSchema.optional(),
    requires_shipping: z.boolean().default(true),
    is_active: z.boolean().default(true),
    is_featured: z.boolean().default(false),
    promotion: z.string().nullish(),
    tenant_id: z.string().min(1, "Tenant ID is required"),
}).refine(
    (data) => !data.has_variants || data.variants.length > 0,
    {
        message: "At least one variant must be added when product has variants",
        path: ["variants"]
    }
);

// Export the type
export type ProductFormValues = z.infer<typeof productFormSchema>; 