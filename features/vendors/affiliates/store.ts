import { create } from 'zustand';
import { apiClient } from '@/lib/api/client';
import {
  Affiliate,
  AffiliateError,
  AffiliateFilter,
  AffiliateStatus,
  CreateAffiliatePayload,
  UpdateAffiliatePayload,
  VerificationDocument,
  ApiResponse,
  AffiliateFormValues,
} from './types';

interface AffiliateStoreState {
  affiliates: Affiliate[];
  affiliate: Affiliate | null;
  loading: boolean;
  error: AffiliateError | null;
  activeAction: string | null;
  totalAffiliates: number;
  pagination: {
    skip: number;
    limit: number;
    currentPage: number;
  };

  setActiveAction: (action: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: AffiliateError | null) => void;
  setAffiliate: (affiliate: Affiliate | null) => void;
  setAffiliates: (affiliates: Affiliate[]) => void;
  setPagination: (pagination: { skip: number; limit: number; currentPage: number; totalAffiliates: number }) => void;

  fetchAffiliates: (filter?: AffiliateFilter, headers?: Record<string, string>) => Promise<void>;
  fetchAffiliate: (id: string, headers?: Record<string, string>) => Promise<Affiliate | null>;
  createAffiliate: (payload: CreateAffiliatePayload, headers?: Record<string, string>) => Promise<Affiliate | null>;
  updateAffiliate: (id: string, payload: UpdateAffiliatePayload, headers?: Record<string, string>) => Promise<Affiliate | null>;
  updateAffiliateStatus: (
    affiliateId: string,
    statusData: { verification_status?: Affiliate['verification_status']; is_active?: boolean; rejection_reason?: string },
    headers?: Record<string, string>
  ) => Promise<Affiliate | null>;
  uploadKycDocuments: (affiliateId: string, documents: VerificationDocument[], headers?: Record<string, string>) => Promise<void>;
}

const initialPagination = {
  skip: 0,
  limit: 10,
  currentPage: 1,
};

export const useAffiliateStore = create<AffiliateStoreState>()((set, get) => ({
  affiliates: [],
  affiliate: null,
  loading: false,
  error: null,
  activeAction: null,
  totalAffiliates: 0,
  pagination: { ...initialPagination },

  setActiveAction: (action) => set({ activeAction: action, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  setAffiliate: (affiliate) => set({ affiliate, error: null, loading: false }),
  setAffiliates: (affiliates) => set({ affiliates, error: null, loading: false }),
  setPagination: ({ skip, limit, currentPage, totalAffiliates }) =>
    set({ pagination: { skip, limit, currentPage }, totalAffiliates, loading: false }),

  fetchAffiliates: async (filter: AffiliateFilter = {}, headers?: Record<string, string>) => {
    const { setActiveAction, setLoading, setError, setAffiliates, setPagination } = get();
    setActiveAction('fetchList');
    setLoading(true);
    let axiosResponse;
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('skip', (filter.skip ?? initialPagination.skip).toString());
      queryParams.append('limit', (filter.limit ?? initialPagination.limit).toString());
      if (filter.search) queryParams.append('search', filter.search);
      if (filter.status) queryParams.append('status', filter.status);
      if (typeof filter.is_active === 'boolean') queryParams.append('is_active', String(filter.is_active));
      if (filter.vendor_id) queryParams.append('vendor_id', filter.vendor_id);

      axiosResponse = await apiClient.get<{ affiliates: Affiliate[]; total: number; currentPage?: number }>(
        `/winga?${queryParams.toString()}`,
        headers
      );

      const serverPayload = axiosResponse.data; // This is { affiliates: [], total: X, ... }

      if (serverPayload && serverPayload.affiliates && typeof serverPayload.total === 'number') {
        setAffiliates(serverPayload.affiliates || []);
        setPagination({
          skip: filter.skip ?? initialPagination.skip,
          limit: filter.limit ?? initialPagination.limit,
          currentPage: serverPayload.currentPage ??
                       (filter.skip !== undefined && filter.limit !== undefined && filter.limit > 0
                         ? (filter.skip / filter.limit) + 1
                         : initialPagination.currentPage),
          totalAffiliates: serverPayload.total || 0,
        });
      } else {
        console.error('Failed to fetch affiliates or invalid server payload structure:', serverPayload);
        setError({
          message: 'Invalid server payload structure for affiliates.',
          status: axiosResponse.status, // HTTP status from the actual response
          action: 'fetchList',
        });
      }
    } catch (err: any) {
      console.error('Error fetching affiliates:', err);
      setError({
        message: err.response?.data?.message || err.message || 'An unexpected error occurred while fetching affiliates.',
        status: err.response?.status, // Status from error response, if available. If axiosResponse was assigned before error, its status is in err.response.status
        details: err.response?.data?.errors || err.stack, // Provide stack for non-HTTP errors
        action: 'fetchList',
      });
    }
  },

  fetchAffiliate: async (id: string, headers?: Record<string, string>): Promise<Affiliate | null> => {
    const { setActiveAction, setLoading, setError, setAffiliate } = get();
    setActiveAction('fetchOne');
    setLoading(true);
    let axiosResponse;
    try {
      axiosResponse = await apiClient.get<ApiResponse<Affiliate>>(
        `/winga/${id}`,
        undefined,
        headers
      );
      const responseData = axiosResponse.data; // This is ApiResponse<Affiliate>

      console.log('Affiliates API Full Response:', JSON.stringify(responseData, null, 2)); // Log the full API response

      if (responseData && responseData.success && responseData.data) {
        const affiliateData: Affiliate = responseData.data; // This is the actual Affiliate
        setAffiliate(affiliateData);
        setLoading(false);
        return affiliateData;
      }
      const errorMessage = responseData?.message || `Failed to fetch affiliate ${id}.`;
      console.error(`Failed to fetch affiliate ${id} or invalid response structure:`, errorMessage, responseData);
      setError({
        message: errorMessage,
        status: axiosResponse.status,
        action: 'fetchOne',
      });
      setLoading(false);
      return null;
    } catch (err: any) {
      console.error(`Error fetching affiliate ${id}:`, err);
      const errorResponseMessage = err.response?.data?.message || err.message; // Adjusted for single ApiResponse error
      setError({
        message: errorResponseMessage || `Failed to fetch affiliate ${id}.`,
        status: err.response?.status || (axiosResponse ? axiosResponse.status : undefined),
        details: err.response?.data?.errors || err, // Adjusted for single ApiResponse error
        action: 'fetchOne',
      });
      setLoading(false);
      return null;
    }
  },

  createAffiliate: async (payload: CreateAffiliatePayload, headers?: Record<string, string>): Promise<Affiliate | null> => {
    const { setActiveAction, setLoading, setError, fetchAffiliates, setAffiliate } = get();
    setActiveAction('create');
    setLoading(true);
    let axiosResponse;
    try {
      axiosResponse = await apiClient.post<ApiResponse<Affiliate>>(
        '/winga/signup',
        payload,
        headers
      );
      const responseData = axiosResponse.data; // This is ApiResponse<Affiliate>

      if (responseData && responseData.success && responseData.data) {
        const affiliateData: Affiliate = responseData.data; // This is the actual Affiliate
        setAffiliate(affiliateData);
        fetchAffiliates();
        return affiliateData;
      } else {
        const errorMessage = responseData?.message || 'Failed to create affiliate.';
        console.error('Failed to create affiliate or invalid response structure:', errorMessage, responseData);
        setError({
          message: errorMessage,
          status: axiosResponse.status,
          action: 'create',
        });
        return null;
      }
    } catch (err: any) {
      console.error('Error creating affiliate:', err);
      const errorResponseMessage = err.response?.data?.message || err.message; // Adjusted for single ApiResponse error
      setError({
        message: errorResponseMessage || 'Failed to create affiliate.',
        status: err.response?.status || (axiosResponse ? axiosResponse.status : undefined),
        details: err.response?.data?.errors || err, // Adjusted for single ApiResponse error
        action: 'create',
      });
      return null;
    }
  },

  updateAffiliate: async (id: string, payload: UpdateAffiliatePayload, headers?: Record<string, string>): Promise<Affiliate | null> => {
    const { setActiveAction, setLoading, setError, fetchAffiliates, setAffiliate } = get();
    setActiveAction('update');
    setLoading(true);
    let axiosResponse;
    try {
      axiosResponse = await apiClient.put<ApiResponse<Affiliate>>(
        `/winga/${id}`,
        payload,
        headers
      );
      const responseData = axiosResponse.data; // This is ApiResponse<Affiliate>

      if (responseData && responseData.success && responseData.data) {
        const updatedAffiliateInstance: Affiliate = responseData.data; // This is the actual Affiliate
        const currentSingleAffiliate = get().affiliate;
        if (currentSingleAffiliate && currentSingleAffiliate.id === id) {
          setAffiliate(updatedAffiliateInstance);
        }
        fetchAffiliates();
        return updatedAffiliateInstance;
      } else {
        const errorMessage = responseData?.message || `Failed to update affiliate ${id}.`;
        console.error(`Failed to update affiliate ${id} or invalid response structure:`, errorMessage, responseData);
        setError({
          message: errorMessage,
          status: axiosResponse.status,
          action: 'update',
        });
        return null;
      }
    } catch (err: any) {
      console.error(`Error updating affiliate ${id}:`, err);
      const errorResponseMessage = err.response?.data?.message || err.message; // Adjusted for single ApiResponse error
      setError({
        message: errorResponseMessage || `Failed to update affiliate ${id}.`,
        status: err.response?.status || (axiosResponse ? axiosResponse.status : undefined),
        details: err.response?.data?.errors || err, // Adjusted for single ApiResponse error
        action: 'update',
      });
      return null;
    }
  },

  updateAffiliateStatus: async (affiliateId: string, statusData: { verification_status?: Affiliate['verification_status']; is_active?: boolean; rejection_reason?: string }, headers?: Record<string, string>): Promise<Affiliate | null> => {
    const { updateAffiliate } = get();
    // This is a convenience method that calls updateAffiliate
    // The 'statusData' should conform to fields accepted by the main update endpoint for status changes
    return updateAffiliate(affiliateId, statusData as Partial<AffiliateFormValues>, headers);
  },

  uploadKycDocuments: async (affiliateId: string, documents: VerificationDocument[], headers?: Record<string, string>) => {
    const { setActiveAction, setLoading, setError, fetchAffiliate } = get();
    setActiveAction('uploadKyc');
    setLoading(true);
    let axiosResponse;
    try {
      axiosResponse = await apiClient.post<ApiResponse<any>>(
        `/winga/${affiliateId}/kyc-documents`,
        { documents }, // Data payload
        headers        // Pass headers variable directly
      );
      const responseData = axiosResponse.data;

      if (responseData && responseData.success) {
        fetchAffiliate(affiliateId); // This will also handle setLoading(false)
      } else {
        console.error(`Failed to upload KYC documents for affiliate ${affiliateId}:`, responseData?.message);
        setError({
          message: responseData?.message || 'Failed to upload KYC documents.',
          status: axiosResponse.status, // Use HTTP status
          action: 'uploadKyc',
        });
        setLoading(false); // Ensure loading is false if fetchAffiliate is not called
      }
    } catch (err: any) {
      console.error(`Error uploading KYC documents for affiliate ${affiliateId}:`, err);
      setLoading(false);
      setError({
        message: err.message || 'An unexpected error occurred while uploading KYC documents.',
        status: err.response?.status || (axiosResponse ? axiosResponse.status : undefined),
        details: err.response?.data?.errors || err,
        action: 'uploadKyc',
      });
    }
  },

}));
