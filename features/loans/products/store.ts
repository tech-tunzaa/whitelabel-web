import { create } from 'zustand';
import { LoanProduct, LoanProductFilter, LoanProductListResponse, LoanProductAction, LoanProductError, ApiResponse, LoanProductFormValues } from './types';
import { apiClient } from '@/lib/api/client';
import { generateMockLoanProducts } from './data/mock-data';

interface LoanProductStore {
  products: LoanProduct[];
  product: LoanProduct | null;
  loading: boolean;
  storeError: LoanProductError | null;
  activeAction: LoanProductAction | null;
  
  // UI State
  setActiveAction: (action: LoanProductAction | null) => void;
  setLoading: (loading: boolean) => void;
  setStoreError: (error: LoanProductError | null) => void;
  setProduct: (product: LoanProduct | null) => void;
  setProducts: (products: LoanProduct[]) => void;
  
  // API Methods
  fetchProduct: (id: string, headers?: Record<string, string>) => Promise<LoanProduct>;
  fetchProducts: (filter?: LoanProductFilter, headers?: Record<string, string>) => Promise<LoanProductListResponse>;
  createProduct: (data: LoanProductFormValues, headers?: Record<string, string>) => Promise<LoanProduct>;
  updateProduct: (id: string, data: Partial<LoanProductFormValues>, headers?: Record<string, string>) => Promise<LoanProduct>;
  updateProductStatus: (id: string, isActive: boolean, headers?: Record<string, string>) => Promise<void>;
}

export const useLoanProductStore = create<LoanProductStore>()(
  (set, get) => ({
    products: [],
    product: null,
    loading: false,
    storeError: null,
    activeAction: null,

    setActiveAction: (action) => set({ activeAction: action }),
    setLoading: (loading) => set({ loading }),
    setStoreError: (error) => set({ storeError: error }),
    setProduct: (product) => set({ product }),
    setProducts: (products) => set({ products }),

    fetchProduct: async (id: string, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError, setProduct } = get();
      try {
        setActiveAction('fetchOne');
        setLoading(true);
        
        // For now, we'll use mock data
        // In a real implementation, this would be an API call
        // const response = await apiClient.get<ApiResponse<LoanProduct>>(`/loans/products/${id}`, undefined, headers);
        
        // Mock implementation
        const mockProducts = generateMockLoanProducts();
        const product = mockProducts.find(product => product.product_id === id);
        
        if (product) {
          setProduct(product);
          setLoading(false);
          return product;
        }
        
        throw new Error('Loan product not found');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch loan product';
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

    fetchProducts: async (filter: LoanProductFilter = {}, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError, setProducts } = get();
      try {
        setActiveAction('fetchList');
        setLoading(true);
        
        // For now, we'll use mock data
        // In a real implementation, this would be an API call
        // const response = await apiClient.get<ApiResponse<LoanProductListResponse>>(`/loans/products`, undefined, headers);
        
        // Mock implementation
        const mockProducts = generateMockLoanProducts();
        
        // Filter products based on search params
        let filteredProducts = mockProducts;
        
        if (filter.search) {
          const search = filter.search.toLowerCase();
          filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(search) || 
            product.description.toLowerCase().includes(search)
          );
        }
        
        if (filter.provider_id) {
          filteredProducts = filteredProducts.filter(product => 
            product.provider_id === filter.provider_id
          );
        }
        
        if (filter.is_active !== undefined) {
          filteredProducts = filteredProducts.filter(product => 
            product.is_active === filter.is_active
          );
        }
        
        if (filter.min_interest_rate !== undefined) {
          filteredProducts = filteredProducts.filter(product => 
            product.interest_rate >= filter.min_interest_rate!
          );
        }
        
        if (filter.max_interest_rate !== undefined) {
          filteredProducts = filteredProducts.filter(product => 
            product.interest_rate <= filter.max_interest_rate!
          );
        }
        
        // Handle pagination
        const skip = filter.skip || 0;
        const limit = filter.limit || 10;
        const paginatedProducts = filteredProducts.slice(skip, skip + limit);
        
        const productResponse: LoanProductListResponse = {
          items: paginatedProducts,
          total: filteredProducts.length,
          skip,
          limit
        };
        
        setProducts(paginatedProducts);
        setLoading(false);
        return productResponse;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch loan products';
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

    createProduct: async (data: LoanProductFormValues, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError } = get();
      try {
        setActiveAction('create');
        setLoading(true);
        
        // For now, we'll use mock data
        // In a real implementation, this would be an API call
        // const response = await apiClient.post<ApiResponse<LoanProduct>>('/loans/products', data, headers);
        
        // Mock implementation
        const newProduct: LoanProduct = {
          product_id: `product_${Date.now()}`,
          tenant_id: data.tenant_id,
          provider_id: data.provider_id,
          name: data.name,
          description: data.description,
          interest_rate: parseFloat(data.interest_rate),
          term_options: data.term_options,
          payment_frequency: data.payment_frequency,
          min_amount: parseFloat(data.min_amount),
          max_amount: parseFloat(data.max_amount),
          processing_fee: data.processing_fee ? parseFloat(data.processing_fee) : undefined,
          is_active: data.is_active,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // In a real app, this would be persisted to a database
        const mockProducts = generateMockLoanProducts();
        mockProducts.push(newProduct);
        
        setLoading(false);
        return newProduct;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create loan product';
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

    updateProduct: async (id: string, data: Partial<LoanProductFormValues>, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError, setProduct, products, setProducts } = get();
      try {
        setActiveAction('update');
        setLoading(true);
        
        // For now, we'll use mock data
        // In a real implementation, this would be an API call
        // const response = await apiClient.put<ApiResponse<LoanProduct>>(`/loans/products/${id}`, data, headers);
        
        // Mock implementation
        const mockProducts = [...products];
        const productIndex = mockProducts.findIndex(p => p.product_id === id);
        
        if (productIndex === -1) {
          throw new Error('Loan product not found');
        }
        
        // Convert string values to numbers for numeric fields
        const processedData = {
          ...data,
          interest_rate: data.interest_rate !== undefined ? parseFloat(data.interest_rate) : undefined,
          min_amount: data.min_amount !== undefined ? parseFloat(data.min_amount) : undefined,
          max_amount: data.max_amount !== undefined ? parseFloat(data.max_amount) : undefined,
          processing_fee: data.processing_fee !== undefined ? parseFloat(data.processing_fee) : undefined
        };
        
        const updatedProduct = {
          ...mockProducts[productIndex],
          ...processedData,
          updated_at: new Date().toISOString()
        };
        
        mockProducts[productIndex] = updatedProduct as LoanProduct;
        setProducts(mockProducts);
        setProduct(updatedProduct as LoanProduct);
        
        setLoading(false);
        return updatedProduct as LoanProduct;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update loan product';
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

    updateProductStatus: async (id: string, isActive: boolean, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError, products, setProducts } = get();
      try {
        setActiveAction('updateStatus');
        setLoading(true);
        
        // For now, we'll use mock data
        // In a real implementation, this would be an API call
        // const response = await apiClient.patch<ApiResponse<void>>(`/loans/products/${id}/status`, { is_active: isActive }, headers);
        
        // Mock implementation
        const mockProducts = [...products];
        const productIndex = mockProducts.findIndex(p => p.product_id === id);
        
        if (productIndex === -1) {
          throw new Error('Loan product not found');
        }
        
        mockProducts[productIndex] = {
          ...mockProducts[productIndex],
          is_active: isActive,
          updated_at: new Date().toISOString()
        };
        
        setProducts(mockProducts);
        setLoading(false);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update loan product status';
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
    }
  })
);
