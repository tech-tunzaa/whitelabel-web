export type ProductStatus = "active" | "draft" | "pending" | "approved" | "rejected";
export type StockStatus = "in_stock" | "out_of_stock" | "low_stock";

export interface ProductImage {
  url: string;
  alt: string;
  pos: number;
}

export interface ProductVariantAttribute {
  name: string;
  value: string;
}

export interface ProductInventory {
  stockLevel: number;
  stockStatus: StockStatus;
}

export interface ProductVariant {
  _id: string;
  sku: string;
  attributes: ProductVariantAttribute[];
  price: number;
  inventory: ProductInventory;
}

export interface Product {
  _id: string;
  product_id: string;
  vendorId: string;
  name: string;
  slug: string;
  status: ProductStatus;
  verification_status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  brandId: string;
  description: string;
  short_description: string;
  sku: string;
  base_price: number;
  sale_price: number;
  cost_price: number;
  inventory_quantity: number;
  inventory_tracking: boolean;
  low_stock_threshold: number;
  vendor_id: string;
  store_id: string;
  category_ids: string[];
  featured: boolean;
  is_active: boolean;
  is_featured: boolean;
  nonDeliverable: boolean;
  requires_shipping: boolean;
  has_variants: boolean;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  categoryIds: string[];
  images: ProductImage[];
  variants?: ProductVariant[];
  price?: number;
  inventory?: ProductInventory;
  promotionId?: string;
  promotion?: any;
  createdAt: string;
  updatedAt: string;
  approved_at?: string;
  rejected_at?: string;
}

export interface ProductFilter {
  skip?: number;
  limit?: number;
  search?: string;
  status?: string;
  categoryId?: string;
  vendorId?: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  skip: number;
  limit: number;
}

export type ProductAction =
  | 'fetchList'
  | 'fetchOne'
  | 'create'
  | 'update'
  | 'delete';

export interface ProductError {
  message: string;
  status?: number;
}
