import { create } from 'zustand';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/client';
import {
  DeliveryPartner,
  DeliveryPartnerFilter,
  DeliveryPartnerListResponse,
  DeliveryPartnerError,
  KycDocument,
  ApiResponse,
} from './types';

interface DeliveryPartnerStore {
  partners: DeliveryPartner[];
  partner: DeliveryPartner | null;
  loading: boolean;
  error: DeliveryPartnerError | null;
  activeAction: string | null;
  // Setters
  setActiveAction: (action: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: DeliveryPartnerError | null) => void;
  setPartner: (partner: DeliveryPartner | null) => void;
  setPartners: (partners: DeliveryPartner[]) => void;
  // Async Actions
  fetchDeliveryPartners: (filter?: DeliveryPartnerFilter, headers?: Record<string, string>) => Promise<DeliveryPartnerListResponse>;
  fetchDeliveryPartner: (id: string, headers?: Record<string, string>) => Promise<DeliveryPartner>;
  createDeliveryPartner: (data: Partial<DeliveryPartner>, headers?: Record<string, string>) => Promise<DeliveryPartner>;
  updateDeliveryPartner: (id: string, data: Partial<DeliveryPartner>, headers?: Record<string, string>) => Promise<DeliveryPartner>;
  updateDeliveryPartnerStatus: (id: string, status: 'active' | 'rejected' | 'suspended' | 'pending', reason?: string, headers?: Record<string, string>) => Promise<void>;
  deleteDeliveryPartner: (id: string, headers?: Record<string, string>) => Promise<void>;
  uploadKycDocuments: (id: string, documents: KycDocument[], headers?: Record<string, string>) => Promise<void>;
}

export const useDeliveryPartnerStore = create<DeliveryPartnerStore>()((set, get) => ({
  partners: [],
  partner: null,
  loading: false,
  error: null,
  activeAction: null,

  // Setters
  setActiveAction: (action) => set({ activeAction: action }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error: error }),
  setPartner: (partner) => set({ partner }),
  setPartners: (partners) => set({ partners }),

  // Async Actions
  fetchDeliveryPartners: async (filter: DeliveryPartnerFilter = {}, headers?: Record<string, string>): Promise<DeliveryPartnerListResponse> => {
    const { setActiveAction, setLoading, setError, setPartners } = get();
    setActiveAction('fetchList');
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filter.skip !== undefined) params.append('skip', filter.skip.toString());
      if (filter.limit !== undefined) params.append('limit', filter.limit.toString());
      if (filter.is_active !== undefined) params.append('is_active', filter.is_active.toString());
      if (filter.kyc_verified !== undefined) params.append('kyc_verified', filter.kyc_verified.toString());
      if (filter.partner_type) params.append('partner_type', filter.partner_type);

      const response = await apiClient.get<any>(`/partners/?${params.toString()}`, undefined, headers);
      
      console.log('API Response:', response);

      let partnerData: DeliveryPartnerListResponse | null = null;
      const payload: any = response.data;
      
      // The API can return data directly or nested within a 'data' property.
      // This handles the case where payload is DeliveryPartnerListResponse.
      if (payload && Array.isArray(payload.items)) {
        console.log('Treating payload directly as DeliveryPartnerListResponse');
        partnerData = payload as DeliveryPartnerListResponse;
      } 
      // This handles the case where payload is { data: DeliveryPartnerListResponse }.
      else if (payload && payload.data && Array.isArray(payload.data.items)) {
        console.log('Treating payload as nested object');
        partnerData = payload.data as DeliveryPartnerListResponse;
      }

      if (partnerData) {
        setPartners(partnerData.items);
        return partnerData;
      }
      
      console.warn('API response did not contain expected data structure:', response.data);
      setPartners([]);
      return {
        items: [],
        total: 0,
        skip: filter.skip || 0,
        limit: filter.limit || 10,
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch delivery partners';
      const errorStatus = error.response?.status;
      console.error('Error fetching delivery partners:', errorMessage, 'Status:', errorStatus);
      setError({
        message: errorMessage,
        status: errorStatus,
      });
      setPartners([]); // Clear data on error
      throw error;
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  },

  fetchDeliveryPartner: async (id: string, headers?: Record<string, string>): Promise<DeliveryPartner> => {
    const { setLoading, setError, setPartner, setActiveAction } = get();
    setActiveAction('fetchDeliveryPartner');
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<any>(`/partners/${id}`, undefined, headers);
      console.log('Received API response for partner:', response.data);

      let partnerData: DeliveryPartner | null = null;
      // Check if data is nested under a 'data' property
      if (response.data && response.data.data) {
        partnerData = response.data.data;
      } 
      // Check if the response data itself is the partner object
      else if (response.data && (response.data.partner_id || response.data._id)) {
        partnerData = response.data;
      }

      if (partnerData) {
        console.log('Setting partner state with:', partnerData);
        setPartner(partnerData);
        return partnerData;
      } else {
        console.error('Partner data not found in response or in unexpected format:', response.data);
        throw new Error('Partner data not found in response');
      }
    } catch (error: any) {
      const errorData = { message: error.message || 'Failed to fetch delivery partner', status: error.response?.status };
      setError(errorData);
      setPartner(null);
      throw errorData;
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  },

  createDeliveryPartner: async (data: Partial<DeliveryPartner>, headers?: Record<string, string>): Promise<DeliveryPartner> => {
    const { setLoading, setError, setActiveAction } = get();
    setActiveAction('createDeliveryPartner');
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<ApiResponse<DeliveryPartner>>('/partners/', data, headers);
      const newPartner = response.data.data;
      set((state) => ({ partners: [...state.partners, newPartner] }));
      toast.success('Delivery partner created successfully.');
      return newPartner;
    } catch (error: any) {
      const errorData = { message: error.message || 'Failed to create delivery partner', status: error.response?.status };
      setError(errorData);
      toast.error(errorData.message);
      throw errorData;
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  },

  updateDeliveryPartner: async (id: string, data: Partial<DeliveryPartner>, headers?: Record<string, string>): Promise<DeliveryPartner> => {
    const { setLoading, setError, setActiveAction } = get();
    setActiveAction('updateDeliveryPartner');
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch<ApiResponse<DeliveryPartner>>(`/partners/${id}`, data, headers);
      const updatedPartner = response.data.data;
      set((state) => ({
        partners: state.partners.map((p) => (p._id === id ? updatedPartner : p)),
        partner: state.partner?._id === id ? updatedPartner : state.partner,
      }));
      toast.success('Delivery partner updated successfully.');
      return updatedPartner;
    } catch (error: any) {
      const errorData = { message: error.message || 'Failed to update delivery partner', status: error.response?.status };
      setError(errorData);
      toast.error(errorData.message);
      throw errorData;
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  },

  updateDeliveryPartnerStatus: async (id, status, reason, headers) => {
    const { setLoading, setError, setActiveAction, fetchDeliveryPartner } = get();
    setActiveAction('updateDeliveryPartnerStatus');
    setLoading(true);
    setError(null);
    try {
      const payload: { status: string; rejection_reason?: string } = { status };
      if (status === 'rejected' && reason) {
        payload.rejection_reason = reason;
      }
      await apiClient.patch(`/partners/${id}/status`, payload, headers);
      toast.success('Partner status updated successfully.');
      // Refresh partner data
      await fetchDeliveryPartner(id, headers);
    } catch (error: any) {
      const errorData = { message: error.message || 'Failed to update partner status', status: error.response?.status };
      setError(errorData);
      toast.error(errorData.message);
      throw errorData;
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  },

  deleteDeliveryPartner: async (id: string, headers?: Record<string, string>): Promise<void> => {
    const { setLoading, setError, setActiveAction } = get();
    setActiveAction('deleteDeliveryPartner');
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/partners/${id}`, undefined, headers);
      set((state) => ({
        partners: state.partners.filter((p) => p._id !== id),
        partner: state.partner?._id === id ? null : state.partner,
      }));
      toast.success('Delivery partner deleted successfully.');
    } catch (error: any) {
      const errorData = { message: error.message || 'Failed to delete delivery partner', status: error.response?.status };
      setError(errorData);
      toast.error(errorData.message);
      throw errorData;
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  },

  uploadKycDocuments: async (id: string, documents: KycDocument[], headers?: Record<string, string>): Promise<void> => {
    const { setLoading, setError, setActiveAction, fetchDeliveryPartner } = get();
    setActiveAction('uploadKycDocuments');
    setLoading(true);
    setError(null);
    try {
      await apiClient.post(`/partners/${id}/kyc/documents`, { documents }, headers);
      toast.success('KYC documents uploaded successfully.');
      // Refresh partner data to show new documents
      await fetchDeliveryPartner(id, headers);
    } catch (error: any) {
      const errorData = { message: error.message || 'Failed to upload KYC documents', status: error.response?.status };
      setError(errorData);
      toast.error(errorData.message);
      throw errorData;
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  },
}));
