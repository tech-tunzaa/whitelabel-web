import { create } from 'zustand';
import { ApiResponse } from '@/features/vendors/types';
import { apiClient } from '@/lib/api/client';
import { DeliveryPartner, DeliveryPartnerFilter, DeliveryPartnerListResponse, DeliveryPartnerAction, DeliveryPartnerError, KycDocument } from './types';

interface DeliveryPartnerStore {
  deliveryPartners: any[];
  deliveryPartner: any | null;
  loading: boolean;
  storeError: DeliveryPartnerError | null;
  activeAction: DeliveryPartnerAction | null;
  setActiveAction: (action: DeliveryPartnerAction | null) => void;
  setLoading: (loading: boolean) => void;
  setStoreError: (error: DeliveryPartnerError | null) => void;
  setDeliveryPartner: (deliveryPartner: any | null) => void;
  setDeliveryPartners: (deliveryPartners: any[]) => void;
  fetchDeliveryPartner: (id: string, headers?: Record<string, string>) => Promise<any>;
  fetchDeliveryPartnerByUser: (userId: string, headers?: Record<string, string>) => Promise<any>;
  fetchDeliveryPartners: (filter?: DeliveryPartnerFilter, headers?: Record<string, string>) => Promise<any>;
  createDeliveryPartner: (data: any, headers?: Record<string, string>) => Promise<any>;
  updateDeliveryPartner: (id: string, data: any, headers?: Record<string, string>) => Promise<any>;
  deleteDeliveryPartner: (id: string, headers?: Record<string, string>) => Promise<any>;
  uploadKycDocuments: (id: string, documents: any[], headers?: Record<string, string>) => Promise<void>;
}

export const useDeliveryPartnerStore = create<DeliveryPartnerStore>()(
  (set, get) => ({
    deliveryPartners: [],
    deliveryPartner: null,
    loading: true,
    storeError: null,
    activeAction: null,

    setActiveAction: (action) => set({ activeAction: action }),
    setLoading: (loading) => set({ loading }),
    setStoreError: (error) => set({ storeError: error }),
    setDeliveryPartner: (deliveryPartner: DeliveryPartner | null) => set({ deliveryPartner }),
    setDeliveryPartners: (deliveryPartners: DeliveryPartner[]) => set({ deliveryPartners }),

    fetchDeliveryPartner: async (id: string, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError, setDeliveryPartner } = get();
      try {
        setActiveAction('fetchOne');
        setLoading(true);
        const response = await apiClient.get<any>(`/partners/${id}/`, undefined, headers);
        
        console.log('Delivery Partner API Response:', response);
        
        // Try multiple possible response structures
        let partnerData = null;
        
        // Option 1: response.data.data structure
        if (response.data && response.data.data) {
          console.log('Found delivery partner data in response.data.data');
          partnerData = response.data.data;
        } 
        // Option 2: response.data structure (direct)
        else if (response.data) {
          console.log('Using response.data directly as delivery partner data');
          partnerData = response.data;
        }
        
        // Check if we found partner data
        if (partnerData) {
          console.log('Successfully extracted delivery partner data:', partnerData);
          
          // Use data as-is
          setDeliveryPartner(partnerData);
          setLoading(false);
          return partnerData;
        }
        
        console.error('Delivery partner data not found or in unexpected format', response);
        setLoading(false);
        throw new Error('Delivery partner data not found or in unexpected format');
      } catch (error: unknown) {
        console.error('Error fetching delivery partner:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch delivery partner';
        const errorStatus = (error as any)?.response?.status;
        setStoreError({
          message: errorMessage,
          status: errorStatus,
        });
        setDeliveryPartner(null);
        setLoading(false);
        throw error;
      } finally {
        setActiveAction(null);
      }
    },

    fetchDeliveryPartnerByUser: async (userId: string, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError, setDeliveryPartner } = get();
      try {
        setActiveAction('fetchByUser');
        setLoading(true);
        const response = await apiClient.get<ApiResponse<any>>(`/partners/?user_id=${userId}`, undefined, headers);
        
        let partnerData = null;
        
        if (response.data && response.data.data) {
          partnerData = response.data.data;
        } else if (response.data) {
          partnerData = response.data;
        }
        
        if (partnerData) {
          // Use data as-is
          setDeliveryPartner(partnerData);
          setLoading(false);
          return partnerData;
        }
        
        throw new Error('Delivery partner not found');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch delivery partner';
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

    fetchDeliveryPartners: async (filter: DeliveryPartnerFilter = {}, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError, setDeliveryPartners } = get();
      try {
        setActiveAction('fetchList');
        setLoading(true);
        const params = new URLSearchParams();
        if (filter.skip) params.append('skip', filter.skip.toString());
        if (filter.limit) params.append('limit', filter.limit.toString());
        if (filter.search) params.append('search', filter.search);
        if (filter.status) params.append('status', filter.status);
        if (filter.type) params.append('type', filter.type);

        const response = await apiClient.get<DeliveryPartnerApiResponse>(`/partners/?${params.toString()}`, undefined, headers);
        
        console.log('API Response:', response);
        
        // Check if response has a nested data property
        if (response.data && response.data.data) {
          console.log('Response data.data:', response.data.data);
          // Use the nested data property
          const partnerData = response.data.data as DeliveryPartnerApiResponse;
          // Update state with the items directly from the API
          const items = Array.isArray(partnerData.items) ? partnerData.items : 
                        Array.isArray(partnerData) ? partnerData : [];
          setDeliveryPartners(items);
          setLoading(false);
          return { ...partnerData, items };
        } else if (response.data) {
          // API might be returning data directly without nesting
          console.log('Treating response.data directly as DeliveryPartnerListResponse');
          const partnerData = response.data as DeliveryPartnerApiResponse;
          const items = Array.isArray(partnerData.items) ? partnerData.items : 
                        Array.isArray(partnerData) ? partnerData : [];
          setDeliveryPartners(items);
          setLoading(false);
          return { ...partnerData, items };
        }
        
        // Return empty result if no data
        console.log('No data found in response, returning empty result');
        const emptyResult = {
          items: [],
          total: 0,
          skip: filter.skip || 0,
          limit: filter.limit || 10
        };
        
        setLoading(false);
        return emptyResult;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch delivery partners';
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

    createDeliveryPartner: async (data: any, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError } = get();
      try {
        setActiveAction('create');
        setLoading(true);
        
        const response = await apiClient.post<ApiResponse<any>>('/partners/', data, headers);
        
        let partnerData = null;
        
        if (response.data && response.data.data) {
          partnerData = response.data.data;
        } else if (response.data) {
          partnerData = response.data;
        }
        
        if (partnerData) {
          setLoading(false);
          return partnerData;
        }
        
        throw new Error('Failed to create delivery partner');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create delivery partner';
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

    updateDeliveryPartner: async (id: string, data: any, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError } = get();
      try {
        setActiveAction('update');
        setLoading(true);
        
        const response = await apiClient.put<ApiResponse<any>>(`/partners/${id}`, data, headers);
        
        let partnerData = null;
        
        if (response.data && response.data.data) {
          partnerData = response.data.data;
        } else if (response.data) {
          partnerData = response.data;
        }
        
        if (partnerData) {
          setLoading(false);
          return partnerData;
        }
        
        throw new Error('Failed to update delivery partner');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update delivery partner';
        const errorStatus = (error as any)?.response?.status;
        setStoreError({
          message: errorMessage,
          status: errorStatus,
        });
        setLoading(false);
        throw error;      } finally {
        setActiveAction(null);
      }
    },

    deleteDeliveryPartner: async (id: string, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError } = get();
      try {
        setActiveAction('delete');
        setLoading(true);
        
        const response = await apiClient.delete<ApiResponse<any>>(`/partners/${id}/`, undefined, headers);
        
        setLoading(false);
        return response.data;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete delivery partner';
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

    uploadKycDocuments: async (id: string, documents: any[], headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError } = get();
      try {
        setActiveAction('uploadKyc');
        setLoading(true);
        
        // Use the API endpoint to update KYC documents
        await apiClient.post<ApiResponse<any>>(
          `/partners/${id}/kyc/documents`,
          documents,
          headers
        );
        
        setLoading(false);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to upload KYC documents';
        const errorStatus = (error as any)?.response?.status;
        
        setStoreError({
          message: errorMessage,
          status: errorStatus || 500
        });
        
        setLoading(false);
        throw error;
      } finally {
        setActiveAction(null);
      }
    }
  })
);
