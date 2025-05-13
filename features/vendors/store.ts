import { create } from 'zustand';
import { Vendor, VendorFilter, VendorListResponse, VendorAction, VendorError, Store, VerificationDocument, ApiResponse, StoreBranding, StoreBanner, VendorApiResponse } from './types';
import { apiClient } from '@/lib/api/client';

interface VendorStore {
  vendors: Vendor[];
  vendor: Vendor | null;
  loading: boolean;
  storeError: VendorError | null;
  activeAction: VendorAction | null;
  setActiveAction: (action: VendorAction | null) => void;
  setLoading: (loading: boolean) => void;
  setStoreError: (error: VendorError | null) => void;
  setVendor: (vendor: Vendor | null) => void;
  setVendors: (vendors: Vendor[]) => void;
  fetchVendor: (id: string, headers?: Record<string, string>) => Promise<Vendor>;
  fetchVendorByUser: (userId: string, headers?: Record<string, string>) => Promise<Vendor>;
  fetchVendors: (filter?: VendorFilter, headers?: Record<string, string>) => Promise<VendorListResponse>;
  createVendor: (data: Partial<Vendor>, headers?: Record<string, string>) => Promise<Vendor>;
  updateVendor: (id: string, data: Partial<Vendor>, headers?: Record<string, string>) => Promise<Vendor>;
  updateVendorStatus: (id: string, status: string, headers?: Record<string, string>) => Promise<void>;
  uploadKycDocuments: (id: string, documents: VerificationDocument[], headers?: Record<string, string>) => Promise<void>;
  // Store related actions
  fetchStore: (id: string, headers?: Record<string, string>) => Promise<Store>;
  createStore: (vendorId: string, data: Partial<Store>, headers?: Record<string, string>) => Promise<Store>;
  updateStoreBranding: (storeId: string, data: Partial<StoreBranding>, headers?: Record<string, string>) => Promise<Store>;
  addStoreBanner: (storeId: string, data: Partial<StoreBanner>, headers?: Record<string, string>) => Promise<void>;
  deleteStoreBanner: (storeId: string, bannerId: string, headers?: Record<string, string>) => Promise<void>;
}

export const useVendorStore = create<VendorStore>()(
  (set, get) => ({
      vendors: [],
      vendor: null,
      loading: true,
      storeError: null,
      activeAction: null,

    setActiveAction: (action) => set({ activeAction: action }),
    setLoading: (loading) => set({ loading }),
    setStoreError: (error) => set({ storeError: error }),
    setVendor: (vendor: Vendor | null) => set({ vendor }),
    setVendors: (vendors: Vendor[]) => set({ vendors }),

    fetchVendor: async (id: string, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError, setVendor } = get();
      try {
        setActiveAction('fetchOne');
        setLoading(true);
        const response = await apiClient.get<any>(`/vendors/${id}`, undefined, headers);
        
        console.log('Vendor API Response:', response);
        
        // Try multiple possible response structures
        let vendorData = null;
        
        // Option 1: response.data.data structure
        if (response.data && response.data.data) {
          console.log('Found vendor data in response.data.data');
          vendorData = response.data.data;
        } 
        // Option 2: response.data structure (direct)
        else if (response.data) {
          console.log('Using response.data directly as vendor data');
          vendorData = response.data;
        }
        
        // Check if we found vendor data and it has the expected properties
        if (vendorData && (vendorData.business_name || vendorData.vendor_id || vendorData._id)) {
          console.log('Successfully extracted vendor data:', vendorData);
          // Ensure we have vendor_id
          if (!vendorData.vendor_id && vendorData._id) {
            vendorData.vendor_id = vendorData._id;
          }
          setVendor(vendorData as Vendor);
          setLoading(false);
          return vendorData as Vendor;
        }
        
        console.error('Vendor data not found or in unexpected format', response);
        setLoading(false);
        throw new Error('Vendor data not found or in unexpected format');
      } catch (error: unknown) {
        console.error('Error fetching vendor:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch vendor';
        const errorStatus = (error as any)?.response?.status;
        setStoreError({
          message: errorMessage,
          status: errorStatus,
        });
        setVendor(null);
        setLoading(false);
        throw error;
      } finally {
        setActiveAction(null);
      }
    },

    fetchVendorByUser: async (userId: string, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError, setVendor } = get();
      try {
        setActiveAction('fetchByUser');
        setLoading(true);
        // The API might have a different endpoint for fetching by user ID
        // Adjust this endpoint according to the actual API
        const response = await apiClient.get<ApiResponse<Vendor>>(`/vendors?user_id=${userId}`, undefined, headers);
        if (response.data && response.data.data) {
          // Use type assertion to convert API response to Vendor
          const vendorData = (response.data.data as unknown) as Vendor;
          setVendor(vendorData);
          return vendorData;
        }
        throw new Error('Vendor not found');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch vendor';
        const errorStatus = (error as any)?.response?.status;
        setStoreError({
          message: errorMessage,
          status: errorStatus,
        });
        throw error;
      } finally {
        setLoading(false);
        setActiveAction(null);
      }
    },

    fetchVendors: async (filter: VendorFilter = {}, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError, setVendors } = get();
      try {
        setActiveAction('fetchList');
        setLoading(true);
        const params = new URLSearchParams();
        if (filter.skip) params.append('skip', filter.skip.toString());
        if (filter.limit) params.append('limit', filter.limit.toString());
        if (filter.search) params.append('search', filter.search);
        if (filter.verification_status) params.append('verification_status', filter.verification_status);
        if (filter.is_active !== undefined) params.append('is_active', filter.is_active.toString());

        const response = await apiClient.get<ApiResponse<VendorListResponse>>(`/vendors?${params.toString()}`, undefined, headers);
        
        // Log the response structure to debug
        console.log('API Response:', response);
        console.log('Response data:', response.data);
        
        if (response.data) {
          // Check if response has a nested data property
          if (response.data.data) {
            console.log('Response data.data:', response.data.data);
            // Use the nested data property
            const vendorData = response.data.data as VendorListResponse;
            console.log('Extracted vendor data:', vendorData);
            // Update state with the items directly from the API
            setVendors(vendorData.items || []);
            setLoading(false);
            return vendorData;
          } else {
            // API might be returning data directly without nesting
            console.log('Treating response.data directly as VendorListResponse');
            const vendorData = response.data as unknown as VendorListResponse;
            console.log('Vendor data from direct approach:', vendorData);
            setVendors(vendorData.items || []);
            setLoading(false);
            return vendorData;
          }
        }
        
        // Return empty result if no data
        console.log('No data found in response, returning empty result');
        const emptyResult: VendorListResponse = {
          items: [],
          total: 0,
          skip: filter.skip || 0,
          limit: filter.limit || 10
        };
        
        setLoading(false);
        return emptyResult;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch vendors';
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

    createVendor: async (data: Partial<Vendor>, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError } = get();
      try {
        setActiveAction('create');
        setLoading(true);
        const response = await apiClient.post<ApiResponse<Vendor>>('/vendors', data, headers);
        if (response.data && response.data.data) {
          const vendor = response.data.data as Vendor;
          setLoading(false);
          return vendor;
        }
        throw new Error('Failed to create vendor');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create vendor';
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

    updateVendor: async (id: string, data: Partial<Vendor>, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError, setVendor, vendor } = get();
      try {
        setActiveAction('update');
        setLoading(true);

        // Extract store data if it exists
        const storeData = data.store;
        const vendorData = { ...data };
        delete vendorData.store;

        // Update vendor data
        const response = await apiClient.put<ApiResponse<Vendor>>(`/vendors/${id}`, vendorData, headers);
        if (response.data && response.data.data) {
          const vendorResponse: Vendor = response.data.data as Vendor;

          // Check if we have a store in the update data, if so, ensure it's updated in the response
          if (storeData && !vendorResponse.store) {
            if (vendor && vendor.store) {
              // Add store from current vendor state if missing in response
              vendorResponse.store = vendor.store;
            }
          }

          setVendor(vendorResponse);
          setLoading(false);
          return vendorResponse;
        }
        throw new Error('Failed to update vendor');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update vendor';
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

    updateVendorStatus: async (id: string, status: string, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError } = get();
      try {
        setActiveAction('updateStatus');
        setLoading(true);
        await apiClient.put(`/vendors/${id}/status`, { status }, headers);
        setLoading(false);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update vendor status';
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

    uploadKycDocuments: async (id: string, documents: VerificationDocument[], headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError } = get();
      try {
        setActiveAction('uploadDocuments');
        setLoading(true);
        await apiClient.post(`/vendors/${id}/documents`, { documents }, headers);
        setLoading(false);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to upload documents';
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

    // Store related methods
    fetchStore: async (id: string, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError } = get();
      try {
        setActiveAction('fetchStore');
        setLoading(true);
        const response = await apiClient.get<ApiResponse<Store>>(`/stores/${id}`, undefined, headers);
        if (response.data && response.data.data) {
          const store = response.data.data as Store;
          setLoading(false);
          return store;
        }
        throw new Error('Store not found');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch store';
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

    createStore: async (vendorId: string, data: Partial<Store>, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError } = get();
      try {
        setActiveAction('createStore');
        setLoading(true);
        const response = await apiClient.post<ApiResponse<Store>>(`/vendors/${vendorId}/store`, data, headers);
        if (response.data && response.data.data) {
          const store = response.data.data as Store;
          setLoading(false);
          return store;
        }
        throw new Error('Failed to create store');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create store';
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

    updateStoreBranding: async (storeId: string, data: Partial<StoreBranding>, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError } = get();
      try {
        setActiveAction('updateStoreBranding');
        setLoading(true);
        const response = await apiClient.put<ApiResponse<Store>>(`/stores/${storeId}/branding`, data, headers);
        if (response.data && response.data.data) {
          const store = response.data.data as Store;
          setLoading(false);
          return store;
        }
        throw new Error('Failed to update store branding');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update store branding';
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

    addStoreBanner: async (storeId: string, data: Partial<StoreBanner>, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError } = get();
      try {
        setActiveAction('addStoreBanner');
        setLoading(true);
        await apiClient.post(`/stores/${storeId}/banners`, data, headers);
        setLoading(false);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to add store banner';
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

    deleteStoreBanner: async (storeId: string, bannerId: string, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError } = get();
      try {
        setActiveAction('deleteStoreBanner');
        setLoading(true);
        await apiClient.delete(`/stores/${storeId}/banners/${bannerId}`, undefined, headers);
        setLoading(false);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete store banner';
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
