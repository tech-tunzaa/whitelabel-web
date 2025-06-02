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
  updateVendorStatus: (id: string, status: string, headers?: Record<string, string>, rejection_reason?: string) => Promise<void>;
  uploadKycDocuments: (id: string, documents: VerificationDocument[], headers?: Record<string, string>) => Promise<void>;
  // Store related actions
  fetchStore: (id: string, headers?: Record<string, string>) => Promise<Store>;
  createStore: (vendorId: string, storeData: Partial<Store>, headers?: Record<string, string>) => Promise<Store>;
  updateStoreBranding: (storeId: string, data: Partial<StoreBranding>, headers?: Record<string, string>) => Promise<Store>;
  addStoreBanner: (storeId: string, data: Partial<StoreBanner>, headers?: Record<string, string>) => Promise<void>;
  deleteStoreBanner: (storeId: string, bannerId: string, headers?: Record<string, string>) => Promise<void>;
  updateStore: (vendorId: string, storeId: string, storeData: Partial<Store>, headers?: Record<string, string>) => Promise<Store>;
  fetchStoreByVendor: (vendorId: string, headers?: Record<string, string>) => Promise<Store>;
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
        const response = await apiClient.get<any>(`/marketplace/vendors/${id}`, undefined, headers);

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
        const response = await apiClient.get<ApiResponse<Vendor>>(`/marketplace/vendors?user_id=${userId}`, undefined, headers);
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

        const response = await apiClient.get<ApiResponse<VendorListResponse>>(`/marketplace/vendors?${params.toString()}`, undefined, headers);

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
          } else if (response.data.items) {
            // The items might be directly in response.data (matching our enhanced ApiResponse type)
            console.log('Using response.data.items directly as items array');
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
        const response = await apiClient.post<ApiResponse<Vendor>>('/marketplace/vendors', data, headers);
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
        const response = await apiClient.put<ApiResponse<Vendor>>(`/marketplace/vendors/${id}`, vendorData, headers);
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

    updateVendorStatus: async (id: string, status: string, headers?: Record<string, string>, rejection_reason?: string) => {
      const { setActiveAction, setLoading, setStoreError } = get();
      try {
        setActiveAction('updateStatus');
        setLoading(true);
        // Include rejection_reason in the payload when status is 'rejected'
        const payload = status === 'rejected' && rejection_reason
          ? { status, rejection_reason }
          : { status };
        await apiClient.put(`/marketplace/vendors/${id}/status`, payload, headers);
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
        await apiClient.post(`/marketplace/vendors/${id}/documents`, { documents }, headers);
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
        setActiveAction('fetchOne');
        setLoading(true);

        const response = await apiClient.get<ApiResponse<Store>>(`/marketplace/stores/${id}`, undefined, headers);

        let storeData: Store;
        
        if (response.data && response.data.data) {
          storeData = response.data.data as Store;
        } else if (response.data) {
          // Handle case where API returns data directly without nesting
          storeData = response.data as unknown as Store;
        } else {
          throw new Error('No store data found in response');
        }

        setLoading(false);
        return storeData;
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

    updateStoreBranding: async (storeId: string, data: Partial<StoreBranding>, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError } = get();
      try {
        setActiveAction('updateStoreBranding');
        setLoading(true);
        const response = await apiClient.put<ApiResponse<Store>>(`/marketplace/stores/${storeId}/branding`, data, headers);
        setLoading(false);
        let storeData: Store;
        
        if (response.data && response.data.data) {
          storeData = response.data.data as Store;
        } else {
          storeData = response.data as unknown as Store;
        }
        
        return storeData;
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
        await apiClient.post(`/marketplace/stores/${storeId}/banners`, data, headers);
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
        await apiClient.delete(`/marketplace/stores/${storeId}/banners/${bannerId}`, undefined, headers);
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

    updateStore: async (vendorId: string, storeId: string, storeData: Partial<Store>, headers?: Record<string, string>): Promise<Store> => {
      const { setActiveAction, setLoading, setStoreError } = get();
      try {
        setActiveAction('updateStore');
        setLoading(true);
        
        console.log('Updating store with ID:', storeId, 'for vendor:', vendorId);
        console.log('Store update payload:', storeData);
        
        // Use direct store update endpoint
        const response = await apiClient.put<ApiResponse<Store>>(`/marketplace/stores/${storeId}`, storeData, headers);
        
        console.log('Store update response:', response);
        
        // Try to extract updated store data
        let updatedStore: Store | null = null;
        
        if (response.data && response.data.data) {
          updatedStore = response.data.data as Store;
        } else if (response.data) {
          updatedStore = response.data as unknown as Store;
        }
        
        if (updatedStore && typeof updatedStore === 'object') {
          // Ensure we have an id property for consistency
          if (!updatedStore.id && updatedStore._id) {
            updatedStore.id = updatedStore._id;
          }
          
          // Ensure arrays exist to prevent errors
          if (!Array.isArray(updatedStore.banners)) {
            updatedStore.banners = [];
          }
          
          if (!Array.isArray(updatedStore.categories)) {
            updatedStore.categories = [];
          }
          
          return updatedStore;
        }
        
        throw new Error('Could not extract valid store data from update response');
      } catch (error: any) {
        console.error('Error updating store:', error);
        setStoreError({
          message: error.message || 'Failed to update store',
          status: error.response?.status
        });
        throw error;
      } finally {
        setLoading(false);
        setActiveAction(null);
      }
    },
    
    fetchStoreByVendor: async (vendorId: string, headers?: Record<string, string>): Promise<Store> => {
      const { setActiveAction, setLoading, setStoreError } = get();
      try {
        setActiveAction('fetchStore');
        setLoading(true);

        // Make API request to fetch stores
        console.log('Fetching store for vendor ID:', vendorId);
        const response = await apiClient.get<ApiResponse<Store[]>>(
          `/marketplace/stores`, 
          { vendor_id: vendorId },
          headers
        );

        console.log('Store API Response:', response);
        
        // The response format is an array of stores in items property
        if (response.data && response.data.items && Array.isArray(response.data.items) && response.data.items.length > 0) {
          // Always use the first store in the array (index 0) as mentioned in the requirements
          const storeData = response.data.items[0];
          console.log('Using first store from items array:', storeData);
          
          // Ensure we have an id property for compatibility
          if (!storeData.id && storeData._id) {
            storeData.id = storeData._id;
          }
          
          // Ensure arrays exist to prevent errors
          if (!Array.isArray(storeData.banners)) {
            storeData.banners = [];
          }
          
          if (!Array.isArray(storeData.categories)) {
            storeData.categories = [];
          }
          
          if (!Array.isArray(storeData.featured_categories)) {
            storeData.featured_categories = [];
          }
          
          if (!Array.isArray(storeData.seo_keywords)) {
            storeData.seo_keywords = [];
          }
          
          return storeData as Store;
        }
        
        // If no stores found or empty array
        throw new Error('No store found for this vendor');
      } catch (error: any) {
        console.error('Error fetching store by vendor:', error);
        setStoreError({
          message: error.message || 'Failed to fetch store by vendor ID',
          status: error.response?.status
        });
        throw error;
      } finally {
        setLoading(false);
        setActiveAction(null);
      }
    },
    
    // Create a new store for a vendor
    createStore: async (vendorId: string, storeData: Partial<Store>, headers?: Record<string, string>): Promise<Store> => {
      const { setActiveAction, setLoading, setStoreError } = get();
      try {
        setActiveAction('createStore');
        setLoading(true);
        
        console.log('Creating new store for vendor ID:', vendorId);
        console.log('Store creation payload:', storeData);
        
        // Use vendor-scoped store creation endpoint
        const response = await apiClient.post<ApiResponse<Store>>(
          `/marketplace/vendors/${vendorId}/stores`, 
          storeData, 
          headers
        );
        
        console.log('Store creation response:', response);
        
        // Extract created store data
        let createdStore: Store | null = null;
        
        if (response.data && response.data.data) {
          createdStore = response.data.data as Store;
        } else if (response.data) {
          createdStore = response.data as unknown as Store;
        }
        
        if (createdStore && typeof createdStore === 'object') {
          // Ensure we have an id property for consistency
          if (!createdStore.id && createdStore._id) {
            createdStore.id = createdStore._id;
          }
          
          // Ensure arrays exist to prevent errors
          if (!Array.isArray(createdStore.banners)) {
            createdStore.banners = [];
          }
          
          if (!Array.isArray(createdStore.categories)) {
            createdStore.categories = [];
          }
          
          return createdStore;
        }
        
        throw new Error('Could not extract valid store data from creation response');
      } catch (error: any) {
        console.error('Error creating store:', error);
        setStoreError({
          message: error.message || 'Failed to create store',
          status: error.response?.status
        });
        throw error;
      } finally {
        setLoading(false);
        setActiveAction(null);
      }
    },
  })
);
