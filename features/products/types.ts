export type ProductStatus = "active" | "draft" | "pending" | "approved" | "rejected" | "suspended";
export type StockStatus = "in_stock" | "out_of_stock" | "low_stock";

export interface Category {
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

export interface ProductImage {
  url: string;
  alt?: string; // Alt text is often optional but recommended
  pos?: number; // Optional: for ordering images if needed
  is_primary?: boolean; // To mark the main image
}

export interface ProductVariant {
  _id?: string; // Optional: not present for new variants client-side, present for existing
  name: string; // e.g., "Color"
  value: string; // e.g., "Red"
  price?: number; // Optional, defaults to 0. Applied to product's base_price.
  stock?: number;   // Optional, for variant-specific stock.
  image_url?: string;        // Optional: URL for the variant's thumbnail image.
  sku?: string;       // Optional: e.g., "-RED-XL". Full SKU = product.sku + sku_suffix.
}

export interface Product {
  _id: string; // Typically the database ID
  product_id: string; // Often same as _id, or a separate business-facing ID. Review if needed.
  vendor_id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  sku: string; // Base SKU for the product
  barcode?: string;
  base_price: number;
  sale_price?: number;
  cost_price?: number;
  inventory_quantity?: number; // Overall stock if not tracking by variants or if has_variants is false
  inventory_tracking?: boolean; // True if inventory is tracked (either overall or per variant)
  low_stock_threshold?: number;
  category_ids: string[];
  tags?: string[];
  images?: ProductImage[]; // Main product images
  has_variants: boolean;
  variants?: ProductVariant[];
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  requires_shipping?: boolean;
  status: ProductStatus; // Should align with ProductStatus type
  is_active?: boolean;
  is_featured?: boolean;
  promotion?: string | null; // Assuming promotion can be a string (e.g., ID or code) or null
  store_id: string; // ID of the store this product belongs to
  tenant_id: string; // ID of the tenant this product belongs to

  // Timestamps and other metadata from backend
  created_at?: string | Date;
  updated_at?: string | Date;
  approved_at?: string | Date;
  rejected_at?: string | Date;
  verification_status?: "pending" | "approved" | "rejected" | "suspended";
    rejection_reason?: string;
  categories?: Category[];
  // Add any other fields that your backend `Product` model might have
  // For example:
  // brand_id?: string;
  // currency_code?: string;
}

// Note: ProductFormValues will be inferred from productFormSchema in schema.ts.
// Ensure the Product type here aligns with what your API expects/returns for a full product object,
// and ProductFormValues (derived from schema) aligns with the fields managed directly by the form.

export interface ProductFilter {
  skip?: number;
  limit?: number;
  search?: string;
  status?: ProductStatus;
  verification_status?: "pending" | "approved" | "rejected" | "suspended";
  is_active?: boolean;
  categoryId?: string;
  vendorId?: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  skip?: number;
  limit?: number;
}

export type ProductAction = 'fetchList' | 'fetchOne' | 'create' | 'update' | 'delete' | 'approve' | null;

export interface ProductError {
  message: string;
  status?: number;
}
