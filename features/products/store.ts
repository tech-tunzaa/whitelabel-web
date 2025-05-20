import { create } from 'zustand';
import { ApiResponse } from '@/features/vendors/types';
import { apiClient } from '@/lib/api/client';
import { Product, ProductFilter, ProductListResponse, ProductAction, ProductError } from './types';

// Extended API response type that includes items property
interface ProductApiResponse extends ApiResponse<any> {
  items?: Product[];
  total?: number;
  skip?: number;
  limit?: number;
}

interface ProductStore {
  products: any[];
  product: any | null;
  loading: boolean;
  storeError: ProductError | null;
  activeAction: ProductAction | null;
  setActiveAction: (action: ProductAction | null) => void;
  setLoading: (loading: boolean) => void;
  setStoreError: (error: ProductError | null) => void;
  setProduct: (product: any | null) => void;
  setProducts: (products: any[]) => void;
  fetchProduct: (id: string, headers?: Record<string, string>) => Promise<any>;
  fetchProducts: (filter?: ProductFilter, headers?: Record<string, string>) => Promise<any>;
  createProduct: (data: any, headers?: Record<string, string>) => Promise<any>;
  updateProduct: (id: string, data: any, headers?: Record<string, string>) => Promise<any>;
  deleteProduct: (id: string, headers?: Record<string, string>) => Promise<any>;
}

export const useProductStore = create<ProductStore>()(
  (set, get) => ({
    products: [],
    product: null,
    loading: true,
    storeError: null,
    activeAction: null,

    setActiveAction: (action) => set({ activeAction: action }),
    setLoading: (loading) => set({ loading }),
    setStoreError: (error) => set({ storeError: error }),
    setProduct: (product: Product | null) => set({ product }),
    setProducts: (products: Product[]) => set({ products }),

    fetchProduct: async (id: string, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError, setProduct } = get();
      try {
        setActiveAction('fetchOne');
        setLoading(true);
        const response = await apiClient.get<any>(`/products/${id}`, undefined, headers);
        
        // Try multiple possible response structures
        let productData = null;
        
        // Option 1: response.data.data structure
        if (response.data && response.data.data) {
          productData = response.data.data;
        } 
        // Option 2: response.data structure (direct)
        else if (response.data) {
          productData = response.data;
        }
        
        // Check if we found product data
        if (productData) {
          // Use data as-is
          setProduct(productData);
          setLoading(false);
          return productData;
        }
        
        setLoading(false);
        throw new Error('Product data not found or in unexpected format');
      } catch (error: unknown) {
        console.error('Error fetching product:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch product';
        const errorStatus = (error as any)?.response?.status;
        setStoreError({
          message: errorMessage,
          status: errorStatus,
        });
        setProduct(null);
        setLoading(false);
        throw error;
      } finally {
        setActiveAction(null);
      }
    },

    fetchProducts: async (filter: ProductFilter = {}, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError, setProducts } = get();
      try {
        setActiveAction('fetchList');
        setLoading(true);
        const params = new URLSearchParams();
        if (filter.skip) params.append('skip', filter.skip.toString());
        if (filter.limit) params.append('limit', filter.limit.toString());
        if (filter.search) params.append('search', filter.search);
        if (filter.status) params.append('status', filter.status);
        if (filter.categoryId) params.append('category_id', filter.categoryId);
        if (filter.vendorId) params.append('vendor_id', filter.vendorId);

        const response = await apiClient.get<ProductApiResponse>(`/products/?${params.toString()}`, undefined, headers);
        
        // Check if response has a nested data property
        if (response.data && response.data.data) {
          // Use the nested data property
          const productData = response.data.data as ProductApiResponse;
          // Update state with the items directly from the API
          const items = Array.isArray(productData.items) ? productData.items : 
                        Array.isArray(productData) ? productData : [];
          setProducts(items);
          setLoading(false);
          return { ...productData, items };
        } else if (response.data) {
          // API might be returning data directly without nesting
          const productData = response.data as ProductApiResponse;
          const items = Array.isArray(productData.items) ? productData.items : 
                        Array.isArray(productData) ? productData : [];
          setProducts(items);
          setLoading(false);
          return { ...productData, items };
        }
        
        // Return empty result if no data
        const emptyResult = {
          items: [],
          total: 0,
          skip: filter.skip || 0,
          limit: filter.limit || 10
        };
        
        setLoading(false);
        return emptyResult;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products';
        const errorStatus = (error as any)?.response?.status;
        setStoreError({
          message: errorMessage,
          status: errorStatus,
        });
        setLoading(false);
        throw error;
      } finally {
        setActiveAction(null);
      }
    },

    createProduct: async (data: any, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError } = get();
      try {
        setActiveAction('create');
        setLoading(true);
        
        const response = await apiClient.post<ApiResponse<any>>('/products/', data, headers);
        
        let productData = null;
        
        if (response.data && response.data.data) {
          productData = response.data.data;
        } else if (response.data) {
          productData = response.data;
        }
        
        setLoading(false);
        return productData;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create product';
        const errorStatus = (error as any)?.response?.status;
        setStoreError({
          message: errorMessage,
          status: errorStatus,
        });
        setLoading(false);
        throw error;
      } finally {
        setActiveAction(null);
      }
    },

    updateProduct: async (id: string, data: any, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError } = get();
      try {
        setActiveAction('update');
        setLoading(true);
        
        const response = await apiClient.put<ApiResponse<any>>(`/products/${id}`, data, headers);
        
        let productData = null;
        
        if (response.data && response.data.data) {
          productData = response.data.data;
        } else if (response.data) {
          productData = response.data;
        }
        
        setLoading(false);
        return productData;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update product';
        const errorStatus = (error as any)?.response?.status;
        setStoreError({
          message: errorMessage,
          status: errorStatus,
        });
        setLoading(false);
        throw error;
      } finally {
        setActiveAction(null);
      }
    },

    deleteProduct: async (id: string, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError } = get();
      try {
        setActiveAction('delete');
        setLoading(true);
        
        const response = await apiClient.delete<ApiResponse<any>>(`/products/${id}`, undefined, headers);
        
        setLoading(false);
        return response.data;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete product';
        const errorStatus = (error as any)?.response?.status;
        setStoreError({
          message: errorMessage,
          status: errorStatus,
        });
        setLoading(false);
        throw error;
      } finally {
        setActiveAction(null);
      }
    },
  })
);
