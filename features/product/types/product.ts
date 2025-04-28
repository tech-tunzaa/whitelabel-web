export type ProductStatus = "active" | "draft";

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
  stockStatus: string;
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
  categoryIds: string[];
  images: ProductImage[];
  variants?: ProductVariant[];
  price?: number;
  inventory?: ProductInventory;
  promotionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  selectedProduct: Product | null;
}

export interface ProductActions {
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  setSelectedProduct: (product: Product | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}
