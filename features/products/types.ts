export type ProductStatus = "active" | "draft" | "pending";
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
  vendorId: string;
  name: string;
  slug: string;
  status: ProductStatus;
  brandId: string;
  description: string;
  featured: boolean;
  nonDeliverable: boolean;
  categoryIds: string[];
  images: ProductImage[];
  variants?: ProductVariant[];
  price?: number;
  inventory?: ProductInventory;
  promotionId?: string;
  createdAt: string;
  updatedAt: string;
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
