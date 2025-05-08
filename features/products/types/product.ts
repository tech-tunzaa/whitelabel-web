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
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFormData extends Omit<Product, "_id" | "createdAt" | "updatedAt"> { }

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
  fetchProducts: () => Promise<void>;
  createProduct: (productData: ProductFormData) => Promise<Product>;
  updateProductApi: (productId: string, productData: ProductFormData) => Promise<Product>;
  deleteProductApi: (productId: string) => Promise<void>;
}
