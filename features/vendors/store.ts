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
  setVendors: (vendors: VendorApiResponse) => void;
  fetchVendor: (id: string, headers?: Record<string, string>) => Promise<Vendor>;
  fetchVendors: (filter?: VendorFilter, headers?: Record<string, string>) => Promise<VendorListResponse>;
  createVendor: (data: Partial<Vendor>, headers?: Record<string, string>) => Promise<Vendor>;
  updateVendor: (id: string, data: Partial<Vendor>, headers?: Record<string, string>) => Promise<Vendor>;
  updateVendorStatus: (id: string, status: string, headers?: Record<string, string>, rejection_reason?: string) => Promise<void>;
  // Store related actions
  fetchStoreByVendor: (vendorId: string, headers?: Record<string, string>, limit?: number) => Promise<Store[]>;
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
        // console.log('API Response:', response);
        // console.log('Response data:', response.data);

        if (response.data) {
          // Check if response has a nested data property
          if (response.data.data) {
            console.log('Response data.data:', response.data.data);
            // Use the nested data property
            const vendorData = response.data.data as VendorListResponse;
            // console.log('Extracted vendor data:', vendorData);
            // Update state with the items directly from the API
            setVendors(vendorData || {});
            setLoading(false);
            return vendorData;
          } else if (response.data.items) {
            // The items might be directly in response.data (matching our enhanced ApiResponse type)
            // console.log('Using response.data.items directly as items array');
            const vendorData = response.data as unknown as VendorListResponse;
            // console.log('Vendor data from direct approach:', vendorData);
            setVendors(vendorData || {});
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
      const { setActiveAction, setLoading, setStoreError, setVendor } = get();
      try {
        setActiveAction('update');
        setLoading(true);

        // The API now accepts a unified payload, so we send the data directly.
        const response = await apiClient.put<ApiResponse<Vendor>>(`/marketplace/vendors/${id}`, data, headers);
        
        if (response.data && response.data.data) {
          const updatedVendor = response.data.data as Vendor;
          setVendor(updatedVendor);
          setLoading(false);
          return updatedVendor;
        }
        
        throw new Error('Failed to update vendor: Invalid API response');
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

    updateVendorStatus: async (id: string, status: string, headers?: Record<string, string>, rejection_reason?: string, is_active?: boolean) => {
      const { setActiveAction, setLoading, setStoreError } = get();
      try {
        setActiveAction('updateStatus');
        setLoading(true);
        
        let payload: Record<string, any> = {};
        
        // Handle different cases based on status and is_active
        if (status === 'active' || status === 'inactive') {
          // For activate/deactivate actions, set is_active and maintain approved status
          payload = { is_active: status === 'active', status: 'approved' };
        } else if (status === 'approved') {
          // For approval, set status to approved and is_active to false
          payload = { status: 'approved', is_active: false };
        } else if (status === 'rejected' && rejection_reason) {
          // For rejection, include rejection_reason and set is_active to false
          payload = { status: 'rejected', rejection_reason, is_active: false };
        } else {
          // For any other status updates, use as provided
          payload = { status };
          
          // Include is_active if explicitly provided
          if (typeof is_active === 'boolean') {
            payload.is_active = is_active;
          }
        }
        
        console.log(`Updating vendor ${id} status with payload:`, payload);
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

    // Store related methods
    fetchStoreByVendor: async (vendorId: string, headers?: Record<string, string>, limit?: number): Promise<Store[]> => {
      const { setActiveAction, setLoading, setStoreError } = get();
      try {
        setActiveAction('fetchStore');
        setLoading(true);

        // Make API request to fetch stores
        console.log('Fetching store for vendor ID:', vendorId, 'with limit:', limit);
        
        // Looking at the api client implementation, we need to pass params as the second parameter and headers as the third
        // The client method signature is: get<T>(url: string, params?: any, headers?: Record<string, string>)
        
        // Create params object with vendor_id and limit
        const params = { 
          vendor_id: vendorId, // Include vendor_id in the request body
          ...(limit ? { limit } : {})
        };
        
        // Make the API call with the correct endpoint and parameter order
        // 1. URL endpoint for stores
        // 2. Query params with vendor_id and limit
        // 3. Headers as the third parameter
        const response = await apiClient.get('/marketplace/stores', params, headers);

        console.log('Raw Store API response:', response.data);
        
        if (response.status === 200) {
          const responseData = response.data as any; // Cast to any to handle various response structures
          
          // Case 1: Response has items array (pagination structure)
          if (responseData && responseData.items && Array.isArray(responseData.items)) {
            const storesData = responseData.items as Store[];
            console.log('Extracted stores from items array:', storesData);
            return storesData;
          }
          
          // Case 2: Response is already an array of stores
          if (responseData && Array.isArray(responseData)) {
            console.log('Response is already an array of stores:', responseData);
            return responseData as Store[];
          }
          
          // Case 3: Response is a single store object (not in an array)
          if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
            // Check if it has store-like properties
            if ('_id' in responseData || 'store_name' in responseData) {
              console.log('Response is a single store object, converting to array:', responseData);
              return [responseData as Store];
            }
          }
          
          // Case 4: Unknown structure but has some data - try to use it
          if (responseData) {
            console.log('Unknown response structure, attempting to use as is:', responseData);
            return Array.isArray(responseData) ? responseData as Store[] : [responseData as Store];
          }
          
          // Default: No valid data found
          console.log('No stores found for this vendor, returning empty array');
          return [];
        }
        
        // If API call was not successful
        console.log('API call failed, returning empty array');
        return [];
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
  })
);
