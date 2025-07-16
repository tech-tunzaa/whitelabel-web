import { create } from 'zustand';
import { apiClient, ApiResponse as CoreApiResponse } from '@/lib/api/client'; // Renamed to CoreApiResponse to avoid conflict
import type { ApiResponse } from '@/lib/api/client';
import {
  Affiliate,
  AffiliateError,
  AffiliateFilter,
  AffiliateStatus,
  CreateAffiliatePayload,
  UpdateAffiliatePayload,
  VerificationDocument,
  AffiliateFormValues,
  AffiliatesApiResponseData,
  VendorPartnerRequest,
  VendorPartnerRequestsApiResponseData,
  VendorPartnerRequestFilter,
  AffiliateRequest,
  AffiliateAction,
  AffiliateLink,
  AffiliateAnalytics,
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

  vendorPartnerRequests: VendorPartnerRequest[];
  vendorPartnerRequestsLoading: boolean;
  vendorPartnerRequestsError: AffiliateError | null;
  totalVendorPartnerRequests: number;
  vendorPartnerRequestsPagination: {
    skip: number;
    limit: number;
    currentPage: number;
  };

  analytics: AffiliateAnalytics | null;
  analyticsLoading: boolean;
  analyticsError: AffiliateError | null;

  setActiveAction: (action: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: AffiliateError | null) => void;
  setAffiliate: (affiliate: Affiliate | null) => void;
  setAffiliates: (affiliates: Affiliate[]) => void;
  setPagination: (pagination: { skip: number; limit: number; currentPage: number; totalAffiliates: number }) => void;

  setVendorPartnerRequests: (requests: VendorPartnerRequest[]) => void;
  setVendorPartnerRequestsLoading: (loading: boolean) => void;
  setVendorPartnerRequestsError: (error: AffiliateError | null) => void;
  setVendorPartnerRequestsPagination: (pagination: { skip: number; limit: number; currentPage: number; totalRequests: number }) => void;

  fetchAffiliates: (filter?: AffiliateFilter, headers?: Record<string, string>) => Promise<void>;
  fetchAffiliate: (id: string, headers?: Record<string, string>) => Promise<Affiliate | null>;
  createAffiliate: (payload: CreateAffiliatePayload, headers?: Record<string, string>) => Promise<Affiliate | null>;
  updateAffiliate: (id: string, payload: UpdateAffiliatePayload, headers?: Record<string, string>) => Promise<Affiliate | null>;
  updateAffiliateStatus: (
    affiliateId: string,
    statusData: { status?: Affiliate['status']; is_active?: boolean; rejection_reason?: string },
    headers?: Record<string, string>
  ) => Promise<Affiliate | null>;
  fetchAffiliateRequests: (
    filter: AffiliateFilter & { affiliate_id?: string; vendor_id?: string },
    headers?: Record<string, string>
  ) => Promise<void>;
  fetchAffiliateLinks: (
    affiliateId: string,
    params?: { skip?: number; limit?: number },
    headers?: Record<string, string>
  ) => Promise<{ links: AffiliateLink[]; total: number }>;
  fetchAffiliateAnalytics: (headers?: Record<string, string>) => Promise<void>;
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

  vendorPartnerRequests: [],
  vendorPartnerRequestsLoading: false,
  vendorPartnerRequestsError: null,
  totalVendorPartnerRequests: 0,
  vendorPartnerRequestsPagination: { ...initialPagination },

  analytics: null,
  analyticsLoading: false,
  analyticsError: null,

  setActiveAction: (action) => set({ activeAction: action, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => {
    const stateUpdate: Partial<AffiliateStoreState> = { error, loading: false, vendorPartnerRequestsLoading: false };
    if (error) {
      switch (error.action) {
        case 'fetchOne':
          stateUpdate.affiliate = null;
          break;
        case 'fetchList':
          stateUpdate.affiliates = [];
          stateUpdate.totalAffiliates = 0;
          break;
      }
    }
    set(stateUpdate);
  },
  setAffiliate: (affiliate) => set({ affiliate, error: null, loading: false }),
  setAffiliates: (affiliates) => set({ affiliates, error: null, loading: false }),
  setPagination: ({ skip, limit, currentPage, totalAffiliates }) =>
    set({ pagination: { skip, limit, currentPage }, totalAffiliates, loading: false }),

  setVendorPartnerRequests: (requests) => set({ vendorPartnerRequests: requests, vendorPartnerRequestsError: null, vendorPartnerRequestsLoading: false }),
  setVendorPartnerRequestsLoading: (loading) => set({ vendorPartnerRequestsLoading: loading }),
  setVendorPartnerRequestsError: (error) => set({ vendorPartnerRequestsError: error, vendorPartnerRequestsLoading: false }),
  setVendorPartnerRequestsPagination: ({ skip, limit, currentPage, totalRequests }) =>
    set({ vendorPartnerRequestsPagination: { skip, limit, currentPage }, totalVendorPartnerRequests: totalRequests, vendorPartnerRequestsLoading: false }),

  fetchAffiliates: async (filter: AffiliateFilter = {}, headers?: Record<string, string>) => {
    const { setLoading, setError, setAffiliates, setPagination } = get();
    setLoading(true);

    try {
      const response = await apiClient.get<ApiResponse<AffiliatesApiResponseData>>(
        '/winga',
        filter,
        headers
      );
      const responseData = response.data;
      if (responseData && responseData.affiliates) {
        setAffiliates(responseData.affiliates);
        setPagination({
          skip: filter.skip || 0,
          limit: filter.limit || 10,
          currentPage: Math.floor((filter.skip || 0) / (filter.limit || 10)) + 1,
          totalAffiliates: responseData.total || 0,
        });
        setError(null);
      } else {
        throw new Error('Invalid response structure from server');
      }
    } catch (err: any) {
      setError({
        message: err.response?.data?.message || err.message || 'Failed to fetch affiliates',
        status: err.response?.status,
        details: err.response?.data?.errors || err.stack,
        action: 'fetchAffiliates',
      });
    } finally {
      setLoading(false);
    }
  },

  fetchAffiliate: async (id: string, headers?: Record<string, string>): Promise<Affiliate | null> => {
    const { setActiveAction, setLoading, setError, setAffiliate } = get();
    setActiveAction('fetchOne');
    setLoading(true);
    set({ affiliate: null, error: null }); // Reset state before fetching

    try {
      const axiosResponse = await apiClient.get<any>(`/winga/${id}`, undefined, headers);
      const responseData = axiosResponse.data;
      let rawData: any = null;

      if (responseData && typeof responseData === 'object' && 'success' in responseData) {
        const coreApiResponse = responseData as CoreApiResponse<any>;
        if (coreApiResponse.success && coreApiResponse.data) {
          rawData = coreApiResponse.data;
        } else if (!coreApiResponse.success) {
          throw new Error(coreApiResponse.message || `API returned success:false for affiliate ${id}`);
        }
      } else if (responseData && typeof responseData === 'object' && ('id' in responseData || 'user_id' in responseData)) {
        rawData = responseData;
      }

      if (rawData) {
        if (!rawData.id && rawData.user_id) {
          rawData.id = rawData.user_id;
        }

        if (rawData.id) {
          setAffiliate(rawData as Affiliate);
          return rawData as Affiliate;
        }
      }

      throw new Error(`Affiliate data for ${id} not found or invalid response structure.`);
    } catch (err: any) {
      setError({
        message: err.response?.data?.message || err.message || `Failed to fetch affiliate ${id}.`,
        status: err.response?.status,
        details: err.response?.data?.errors || err.stack,
        action: 'fetchOne',
      });
      return null;
    }
  },

  createAffiliate: async (payload: CreateAffiliatePayload, headers?: Record<string, string>): Promise<Affiliate | null> => {
    const { setActiveAction, setLoading, setError, fetchAffiliates, setAffiliate, setAffiliates } = get();
    setActiveAction('create');
    setLoading(true);
    let axiosResponse;
    try {
      axiosResponse = await apiClient.post<Affiliate>( // apiClient.post returns AxiosResponse<CoreApiResponse<Affiliate>>
        '/winga/signup',
        payload,
        headers
      );
      const coreApiResponse: CoreApiResponse<Affiliate> = axiosResponse.data;

      if (coreApiResponse && coreApiResponse.success && coreApiResponse.data) {
        const createdAffiliate: Affiliate = coreApiResponse.data as Affiliate;
        setAffiliates([createdAffiliate, ...get().affiliates]);
        setLoading(false);
        return createdAffiliate;
      } else {
        const errorMessage = coreApiResponse?.message || 'Failed to create affiliate or invalid response structure.';
        setError({
          message: errorMessage,
          status: axiosResponse?.status, // HTTP status from the main axios response
          action: 'create',
        });
        setLoading(false);
        return null;
      }
    } catch (err: any) {
      const errorResponseMessage = err.response?.data?.message || err.message;
      setError({
        message: errorResponseMessage || 'Failed to create affiliate.',
        status: err.response?.status || (axiosResponse ? axiosResponse.status : undefined),
        details: err.response?.data?.errors || err,
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
      axiosResponse = await apiClient.patch<Affiliate>(`/winga/${id}`, payload, headers);

      // Handle both wrapped and direct object responses
      const responseData = axiosResponse.data;

      // If response is a plain affiliate object
      if (responseData && typeof responseData === 'object' && 'id' in responseData && 'tenant_id' in responseData) {
        const updatedAffiliateInstance: Affiliate = responseData as Affiliate;
        const currentSingleAffiliate = get().affiliate;
        if (currentSingleAffiliate && currentSingleAffiliate.id === id) {
          setAffiliate(updatedAffiliateInstance);
        }
        setLoading(false);
        return updatedAffiliateInstance;
      }

      // If response is wrapped in { success, data }
      if (responseData && typeof responseData === 'object' && 'success' in responseData) {
        const coreApiResponse = responseData as CoreApiResponse<Affiliate>;
        if (coreApiResponse.success && coreApiResponse.data) {
          const updatedAffiliateInstance: Affiliate = coreApiResponse.data as Affiliate;
          const currentSingleAffiliate = get().affiliate;
          if (currentSingleAffiliate && currentSingleAffiliate.id === id) {
            setAffiliate(updatedAffiliateInstance);
          }
          setLoading(false);
          return updatedAffiliateInstance;
        } else {
          const errorMessage = coreApiResponse?.message || `Failed to update affiliate ${id} or invalid response structure.`;
          setError({
            message: errorMessage,
            status: axiosResponse?.status,
            action: 'update',
          });
          setLoading(false);
          return null;
        }
      }

      // If neither, treat as error
      const errorMessage = `Failed to update affiliate ${id}: Unexpected response structure.`;
      setError({
        message: errorMessage,
        status: axiosResponse?.status,
        action: 'update',
      });
      setLoading(false);
      return null;
    } catch (err: any) {
      const errorResponseMessage = err.response?.data?.message || err.message;
      setError({
        message: errorResponseMessage || `Failed to update affiliate ${id}.`,
        status: err.response?.status || (axiosResponse ? axiosResponse.status : undefined),
        details: err.response?.data?.errors || err,
        action: 'update',
      });
      return null;
    }
  },

  updateAffiliateStatus: async (affiliateId: string, statusData: { status?: Affiliate['status']; is_active?: boolean; rejection_reason?: string }, headers?: Record<string, string>): Promise<Affiliate | null> => {
    const { updateAffiliate } = get();
    return updateAffiliate(affiliateId, statusData as Partial<AffiliateFormValues>, headers);
  },

  fetchAffiliateRequests: async (
    filter: AffiliateFilter & { affiliate_id?: string; vendor_id?: string } = {},
    headers?: Record<string, string>
  ): Promise<void> => {
    const { affiliate_id, vendor_id, ...otherFilters } = filter;

    const { setLoading, setError } = get();
    setLoading(true);
    setError(null);

    try {
      const endpoint = affiliate_id
        ? `/winga/affiliate/${affiliate_id}/requests`
        : `/winga/vendor/${vendor_id}/requests`;

      const response = await apiClient.get<ApiResponse<{ requests: AffiliateRequest[]; total: number }>>(
        endpoint,
        otherFilters,
        headers
      );
      const responseData = response.data;
      if (!responseData?.requests) {
        throw new Error('Invalid response structure from server');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch requests';
      setError({
        message: errorMessage,
        status: error.response?.status,
        action: 'fetchRequests' as AffiliateAction,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  },

  fetchAffiliateLinks: async (
    affiliateId: string,
    params: { skip?: number; limit?: number } = {},
    headers?: Record<string, string>
  ): Promise<{ links: AffiliateLink[]; total: number }> => {
    const { setLoading, setError } = get();
    setLoading(true);
    setError(null);
    try {
      const endpoint = `/winga/affiliate/${affiliateId}/links`;
      const response = await apiClient.get<any>(endpoint, params, headers);
      const responseData = response.data;
      if (responseData && Array.isArray(responseData.links)) {
        return {
          links: responseData.links,
          total: responseData.total || responseData.links.length || 0,
        };
      }
      throw new Error('Invalid response structure from server');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch affiliate links';
      setError({
        message: errorMessage,
        status: error.response?.status,
        action: 'fetchAffiliateLinks',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  },

  fetchAffiliateAnalytics: async (headers?: Record<string, string>) => {
    set({ analyticsLoading: true, analyticsError: null });
    try {
      const response = await apiClient.get<AffiliateAnalytics>('/winga/report/analytics', undefined, headers);
      if (response.data) {
        set({ analytics: response.data, analyticsLoading: false, analyticsError: null });
      } else {
        throw new Error('Invalid analytics response');
      }
    } catch (err: any) {
      set({
        analytics: null,
        analyticsLoading: false,
        analyticsError: {
          message: err.response?.data?.message || err.message || 'Failed to fetch analytics',
          status: err.response?.status,
          action: 'fetchAnalytics',
          details: err.response?.data?.errors || err.stack,
        },
      });
    }
  },
}));
