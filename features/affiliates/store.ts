import { create } from 'zustand';
import { apiClient, ApiResponse as CoreApiResponse } from '@/lib/api/client'; // Renamed to CoreApiResponse to avoid conflict
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
  AffiliatesApiResponseData, // Added import
  VendorPartnerRequest,
  VendorPartnerRequestsApiResponseData,
  VendorPartnerRequestFilter,
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
  uploadKycDocuments: (affiliateId: string, documents: VerificationDocument[], headers?: Record<string, string>) => Promise<void>;
  fetchVendorPartnerRequests: (affiliateId: string, filter?: VendorPartnerRequestFilter, headers?: Record<string, string>) => Promise<void>;
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
        case 'fetchVendorPartnerRequests':
          stateUpdate.vendorPartnerRequests = [];
          stateUpdate.totalVendorPartnerRequests = 0;
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
    const { setActiveAction, setLoading, setError, setAffiliates, setPagination } = get();
    setActiveAction('fetchList');
    setLoading(true);
    let axiosResponse;
    try {
      const { vendor_id, ...otherFilters } = filter;
      const queryParams = new URLSearchParams();
      queryParams.append('skip', (otherFilters.skip ?? initialPagination.skip).toString());
      queryParams.append('limit', (otherFilters.limit ?? initialPagination.limit).toString());
      if (otherFilters.search) queryParams.append('search', otherFilters.search);
      if (otherFilters.status) queryParams.append('status', otherFilters.status);
      if (typeof otherFilters.is_active === 'boolean') queryParams.append('is_active', String(otherFilters.is_active));

      let url = '/winga';
      if (vendor_id) {
        url = `/winga/vendor/${vendor_id}/requests`;
      }

      axiosResponse = await apiClient.get<any>(
        url,
        { params: queryParams },
        headers
      );

      const responseData = axiosResponse.data;
      let foundAffiliates: Affiliate[] | undefined;

      // Proactively search for affiliate data in common response structures
      if (responseData) {
          if (Array.isArray(responseData)) {
              foundAffiliates = responseData; // Case 1: Raw array
          } else if (Array.isArray((responseData as any).affiliates)) {
              foundAffiliates = (responseData as any).affiliates; // Case 2: { affiliates: [...] }
          } else if ((responseData as any).data) {
              const data = (responseData as any).data;
              if (Array.isArray(data)) {
                  foundAffiliates = data; // Case 3: { data: [...] }
              } else if (Array.isArray(data.affiliates)) {
                  foundAffiliates = data.affiliates; // Case 4: { data: { affiliates: [...] } }
              }
          }
      }

      if (foundAffiliates) {
        // Try to find pagination details, otherwise default them
        const total = (responseData as any)?.total ?? (responseData as any)?.data?.total ?? foundAffiliates.length;
        const currentPage = (responseData as any)?.currentPage ?? (responseData as any)?.data?.currentPage ?? 1;

        setAffiliates(foundAffiliates);
        setPagination({
          skip: filter.skip ?? initialPagination.skip,
          limit: filter.limit ?? initialPagination.limit,
          currentPage: currentPage,
          totalAffiliates: total,
        });
        setError(null); // Clear previous errors on success
      } else {
        const errorMessage = (responseData as any)?.message || 'Affiliates data not found or invalid response structure.';
        setError({
          message: errorMessage,
          status: axiosResponse?.status,
          action: 'fetchList',
        });
      }
    } catch (err: any) {
      setError({
        message: err.response?.data?.message || err.message || 'An unexpected error occurred while fetching affiliates.',
        status: err.response?.status,
        details: err.response?.data?.errors || err.stack,
        action: 'fetchList',
      });
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

      // Case 1: Wrapped response
      if (responseData && typeof responseData === 'object' && 'success' in responseData) {
        const coreApiResponse = responseData as CoreApiResponse<any>;
        if (coreApiResponse.success && coreApiResponse.data) {
          rawData = coreApiResponse.data;
        } else if (!coreApiResponse.success) {
          throw new Error(coreApiResponse.message || `API returned success:false for affiliate ${id}`);
        }
      } 
      // Case 2: Direct object response
      else if (responseData && typeof responseData === 'object' && ('id' in responseData || 'user_id' in responseData)) {
        rawData = responseData;
      }

      if (rawData) {
        // Normalize data: use user_id as fallback for id
        if (!rawData.id && rawData.user_id) {

          rawData.id = rawData.user_id;
        }

        if (rawData.id) {
          setAffiliate(rawData as Affiliate);
          return rawData as Affiliate;
        }
      }

      // If we fall through, the format is invalid
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
      axiosResponse = await apiClient.patch<Affiliate>( // apiClient.put returns AxiosResponse<CoreApiResponse<Affiliate>>
        `/winga/${id}`,
        payload,
        headers
      );
      const coreApiResponse: CoreApiResponse<Affiliate> = axiosResponse.data;

      if (coreApiResponse && coreApiResponse.success && coreApiResponse.data) {
        const updatedAffiliateInstance: Affiliate = coreApiResponse.data as Affiliate; 
        const currentSingleAffiliate = get().affiliate;
        if (currentSingleAffiliate && currentSingleAffiliate.id === id) {
          setAffiliate(updatedAffiliateInstance);
        }
        fetchAffiliates();
        setLoading(false);
        return updatedAffiliateInstance;
      } else {
        const errorMessage = coreApiResponse?.message || `Failed to update affiliate ${id} or invalid response structure.`;
        setError({
          message: errorMessage,
          status: axiosResponse?.status, // HTTP status from the main axios response
          action: 'update',
        });
        setLoading(false);
        return null;
      }
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

  uploadKycDocuments: async (affiliateId: string, documents: VerificationDocument[], headers?: Record<string, string>) => {
    const { setActiveAction, setLoading, setError, fetchAffiliate } = get();
    setActiveAction('uploadKyc');
    setLoading(true);
    let axiosResponse;
    try {
      axiosResponse = await apiClient.post<any>( // apiClient.post returns AxiosResponse<CoreApiResponse<any>>
        `/winga/${affiliateId}/kyc-documents`,
        { documents }, 
        headers        
      );
      const coreApiResponse: CoreApiResponse<any> = axiosResponse.data;

      if (coreApiResponse && coreApiResponse.success) {
        setLoading(false);
        fetchAffiliate(affiliateId); 
      } else {

        setError({
          message: coreApiResponse?.message || `Failed to upload KYC for affiliate ${affiliateId}.`,
          status: axiosResponse.status, // HTTP status from the main axios response
          action: 'uploadKyc',
        });
        setLoading(false); 
      }
    } catch (err: any) {
      setLoading(false);
      setError({
        message: err.message || 'An unexpected error occurred while uploading KYC documents.',
        status: err.response?.status || (axiosResponse ? axiosResponse.status : undefined),
        details: err.response?.data?.errors || err,
        action: 'uploadKyc',
      });
    }
  },

  fetchVendorPartnerRequests: async (affiliateId: string, filter: VendorPartnerRequestFilter = {}, headers?: Record<string, string>) => {
    const { setActiveAction, setVendorPartnerRequestsLoading, setVendorPartnerRequestsError, setVendorPartnerRequests, setVendorPartnerRequestsPagination } = get();
    setActiveAction('fetchVendorPartnerRequests');
    setVendorPartnerRequestsLoading(true);
    set({ vendorPartnerRequests: [], vendorPartnerRequestsError: null }); // Reset state

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('skip', (filter.skip ?? initialPagination.skip).toString());
      queryParams.append('limit', (filter.limit ?? initialPagination.limit).toString());
      if (filter.status) queryParams.append('status', filter.status);

      const axiosResponse = await apiClient.get<any>(
        `/winga/affiliate/${affiliateId}/requests`,
        { params: queryParams },
        headers
      );

      const responseData = axiosResponse.data;
      let serverPayload: VendorPartnerRequestsApiResponseData | null = null;

      // Case 1: Wrapped response
      if (responseData && typeof responseData === 'object' && 'success' in responseData) {
        const coreApiResponse = responseData as CoreApiResponse<VendorPartnerRequestsApiResponseData>;
        if (coreApiResponse.success && coreApiResponse.data) {
          serverPayload = coreApiResponse.data;
        } else if (!coreApiResponse.success) {
          throw new Error(coreApiResponse.message || 'API returned success:false for vendor partner requests');
        }
      }
      // Case 2: Direct object response
      else if (responseData && typeof responseData === 'object' && 'requests' in responseData && 'total' in responseData) {
        serverPayload = responseData as VendorPartnerRequestsApiResponseData;
      }

      if (serverPayload) {
        setVendorPartnerRequests(serverPayload.requests || []);
        setVendorPartnerRequestsPagination({
          skip: filter.skip ?? initialPagination.skip,
          limit: filter.limit ?? initialPagination.limit,
          currentPage: serverPayload.currentPage ?? Math.floor((filter.skip ?? initialPagination.skip) / (filter.limit ?? initialPagination.limit)) + 1,
          totalRequests: serverPayload.total,
        });
      } else {
        throw new Error('Vendor partner requests data not found or invalid response structure.');
      }
    } catch (err: any) {
      setVendorPartnerRequestsError({
        message: err.response?.data?.message || err.message || 'An unexpected error occurred.',
        status: err.response?.status,
        details: err.response?.data?.errors || err.stack,
        action: 'fetchVendorPartnerRequests',
      });
    } finally {
        setVendorPartnerRequestsLoading(false);
    }
  }

}));
