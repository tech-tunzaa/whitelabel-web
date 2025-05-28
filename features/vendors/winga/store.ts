import { create } from 'zustand';
import { Winga, WingaFilter, WingaListResponse, WingaAction, WingaError, VerificationDocument, ApiResponse } from './types';
import { apiClient } from '@/lib/api/client';
import { wingas } from './data/wingas';

interface WingaStore {
  wingas: Winga[];
  winga: Winga | null;
  loading: boolean;
  storeError: WingaError | null;
  activeAction: WingaAction | null;
  setActiveAction: (action: WingaAction | null) => void;
  setLoading: (loading: boolean) => void;
  setStoreError: (error: WingaError | null) => void;
  setWinga: (winga: Winga | null) => void;
  setWingas: (wingas: Winga[]) => void;
  fetchWinga: (id: string, headers?: Record<string, string>) => Promise<Winga>;
  fetchWingaByVendor: (vendorId: string, headers?: Record<string, string>) => Promise<Winga[]>;
  fetchWingas: (filter?: WingaFilter, headers?: Record<string, string>) => Promise<WingaListResponse>;
  createWinga: (data: Partial<Winga>, headers?: Record<string, string>) => Promise<Winga>;
  updateWinga: (id: string, data: Partial<Winga>, headers?: Record<string, string>) => Promise<Winga>;
  updateWingaStatus: (id: string, status: string, headers?: Record<string, string>, rejection_reason?: string) => Promise<void>;
  uploadKycDocuments: (id: string, documents: VerificationDocument[], headers?: Record<string, string>) => Promise<void>;
}

export const useWingaStore = create<WingaStore>()(
  (set, get) => ({
    wingas: [],
    winga: null,
    loading: true,
    storeError: null,
    activeAction: null,

    setActiveAction: (action) => set({ activeAction: action }),
    setLoading: (loading) => set({ loading }),
    setStoreError: (error) => set({ storeError: error }),
    setWinga: (winga: Winga | null) => set({ winga }),
    setWingas: (wingas: Winga[]) => set({ wingas }),

    fetchWinga: async (id: string, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError, setWinga } = get();
      try {
        setActiveAction('fetchOne');
        setLoading(true);
        
        // For now, use mock data since API is not ready
        const wingaData = wingas.find(w => w.winga_id === id);
        if (wingaData) {
          setWinga(wingaData);
          setLoading(false);
          return wingaData;
        }

        // API code for future use (commented out for now)
        /*
        const response = await apiClient.get<any>(`/marketplace/vendors/wingas/${id}`, undefined, headers);
        
        // Try multiple possible response structures
        let wingaData = null;
        
        // Option 1: response.data.data structure
        if (response.data && response.data.data) {
          wingaData = response.data.data;
        }
        // Option 2: response.data structure (direct)
        else if (response.data) {
          wingaData = response.data;
        }
        
        // Check if we found winga data and it has the expected properties
        if (wingaData && (wingaData.affiliate_name || wingaData.winga_id || wingaData._id)) {
          // Ensure we have winga_id
          if (!wingaData.winga_id && wingaData._id) {
            wingaData.winga_id = wingaData._id;
          }
          setWinga(wingaData as Winga);
          setLoading(false);
          return wingaData as Winga;
        }
        */
        
        throw new Error('Winga data not found');
      } catch (error: unknown) {
        console.error('Error fetching winga:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch winga';
        const errorStatus = (error as any)?.response?.status;
        setStoreError({
          message: errorMessage,
          status: errorStatus,
        });
        setWinga(null);
        setLoading(false);
        throw error;
      } finally {
        setActiveAction(null);
      }
    },

    fetchWingaByVendor: async (vendorId: string, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError, setWingas } = get();
      try {
        setActiveAction('fetchByVendor');
        setLoading(true);
        
        // For now, use mock data since API is not ready
        const filteredWingas = wingas.filter(w => w.vendor_id === vendorId);
        setWingas(filteredWingas);
        setLoading(false);
        return filteredWingas;
        
        // API code for future use (commented out for now)
        /*
        const response = await apiClient.get<ApiResponse<Winga[]>>(
          `/marketplace/vendors/${vendorId}/wingas`, 
          undefined, 
          headers
        );
        
        if (response.data && response.data.data) {
          const wingaData = response.data.data as Winga[];
          setWingas(wingaData);
          return wingaData;
        }
        throw new Error('Wingas not found for this vendor');
        */
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch wingas for vendor';
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

    fetchWingas: async (filter: WingaFilter = {}, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError, setWingas } = get();
      try {
        setActiveAction('fetchList');
        setLoading(true);
        
        // For now, use mock data since API is not ready
        let filteredWingas = [...wingas];
        
        // Apply filters if provided
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          filteredWingas = filteredWingas.filter(winga => 
            winga.affiliate_name.toLowerCase().includes(searchLower) || 
            winga.contact_person.toLowerCase().includes(searchLower) ||
            winga.contact_email.toLowerCase().includes(searchLower)
          );
        }
        
        if (filter.verification_status) {
          filteredWingas = filteredWingas.filter(winga => 
            winga.verification_status === filter.verification_status
          );
        }
        
        if (filter.vendor_id) {
          filteredWingas = filteredWingas.filter(winga => 
            winga.vendor_id === filter.vendor_id
          );
        }
        
        if (filter.is_active !== undefined) {
          filteredWingas = filteredWingas.filter(winga => 
            winga.is_active === filter.is_active
          );
        }
        
        // Apply pagination
        const skip = filter.skip || 0;
        const limit = filter.limit || 10;
        const paginatedWingas = filteredWingas.slice(skip, skip + limit);
        
        const response: WingaListResponse = {
          items: paginatedWingas,
          total: filteredWingas.length,
          skip: skip,
          limit: limit
        };
        
        setWingas(paginatedWingas);
        setLoading(false);
        return response;
        
        // API code for future use (commented out for now)
        /*
        const params = new URLSearchParams();
        if (filter.skip) params.append('skip', filter.skip.toString());
        if (filter.limit) params.append('limit', filter.limit.toString());
        if (filter.search) params.append('search', filter.search);
        if (filter.verification_status) params.append('verification_status', filter.verification_status);
        if (filter.is_active !== undefined) params.append('is_active', filter.is_active.toString());
        if (filter.vendor_id) params.append('vendor_id', filter.vendor_id);

        const response = await apiClient.get<ApiResponse<WingaListResponse>>(
          `/marketplace/vendors/wingas?${params.toString()}`, 
          undefined, 
          headers
        );

        if (response.data && response.data.data) {
          const wingaData = response.data.data as WingaListResponse;
          setWingas(wingaData.items || []);
          setLoading(false);
          return wingaData;
        } else {
          const wingaData = response.data as unknown as WingaListResponse;
          setWingas(wingaData.items || []);
          setLoading(false);
          return wingaData;
        }
        */
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch wingas';
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

    createWinga: async (data: Partial<Winga>, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError } = get();
      try {
        setActiveAction('create');
        setLoading(true);
        
        // For now, create a mock response since API is not ready
        const newWinga: Winga = {
          ...data,
          winga_id: `wnga${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
          verification_status: 'pending',
          is_active: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as Winga;
        
        // Add to local mock data
        wingas.push(newWinga);
        
        setLoading(false);
        return newWinga;
        
        // API code for future use (commented out for now)
        /*
        const response = await apiClient.post<ApiResponse<Winga>>('/marketplace/vendors/wingas', data, headers);
        if (response.data && response.data.data) {
          return response.data.data;
        }
        throw new Error('Failed to create winga: Invalid response');
        */
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create winga';
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

    updateWinga: async (id: string, data: Partial<Winga>, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError, setWinga } = get();
      try {
        setActiveAction('update');
        setLoading(true);
        
        // For now, update mock data since API is not ready
        const wingaIndex = wingas.findIndex(w => w.winga_id === id);
        if (wingaIndex !== -1) {
          const updatedWinga = {
            ...wingas[wingaIndex],
            ...data,
            updated_at: new Date().toISOString()
          };
          
          wingas[wingaIndex] = updatedWinga;
          setWinga(updatedWinga);
          setLoading(false);
          return updatedWinga;
        }
        
        throw new Error('Winga not found');
        
        // API code for future use (commented out for now)
        /*
        const response = await apiClient.patch<ApiResponse<Winga>>(
          `/marketplace/vendors/wingas/${id}`, 
          data, 
          headers
        );
        
        if (response.data && response.data.data) {
          const updatedWinga = response.data.data;
          setWinga(updatedWinga);
          return updatedWinga;
        }
        throw new Error('Failed to update winga: Invalid response');
        */
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update winga';
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

    updateWingaStatus: async (id: string, status: string, headers?: Record<string, string>, rejection_reason?: string) => {
      const { setActiveAction, setLoading, setStoreError, setWinga } = get();
      try {
        setActiveAction('updateStatus');
        setLoading(true);
        
        // For now, update mock data since API is not ready
        const wingaIndex = wingas.findIndex(w => w.winga_id === id);
        if (wingaIndex !== -1) {
          const updatedWinga = {
            ...wingas[wingaIndex],
            verification_status: status,
            updated_at: new Date().toISOString()
          };
          
          if (status === 'rejected' && rejection_reason) {
            updatedWinga.rejection_reason = rejection_reason;
          }
          
          if (status === 'approved') {
            updatedWinga.approved_at = new Date().toISOString();
            updatedWinga.is_active = true;
          }
          
          wingas[wingaIndex] = updatedWinga;
          setWinga(updatedWinga);
          setLoading(false);
          return;
        }
        
        throw new Error('Winga not found');
        
        // API code for future use (commented out for now)
        /*
        const data = {
          verification_status: status,
          ...(status === 'rejected' && rejection_reason ? { rejection_reason } : {})
        };
        
        await apiClient.patch<ApiResponse<Winga>>(
          `/marketplace/vendors/wingas/${id}/status`, 
          data, 
          headers
        );
        */
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update winga status';
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

    uploadKycDocuments: async (id: string, documents: VerificationDocument[], headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError, setWinga } = get();
      try {
        setActiveAction('uploadKyc');
        setLoading(true);
        
        // For now, update mock data since API is not ready
        const wingaIndex = wingas.findIndex(w => w.winga_id === id);
        if (wingaIndex !== -1) {
          const updatedWinga = {
            ...wingas[wingaIndex],
            verification_documents: [
              ...(wingas[wingaIndex].verification_documents || []),
              ...documents.map(doc => ({
                ...doc,
                document_id: `doc${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
                verification_status: 'pending',
                submitted_at: new Date().toISOString()
              }))
            ],
            updated_at: new Date().toISOString()
          };
          
          wingas[wingaIndex] = updatedWinga;
          setWinga(updatedWinga);
          setLoading(false);
          return;
        }
        
        throw new Error('Winga not found');
        
        // API code for future use (commented out for now)
        /*
        const formData = new FormData();
        
        // Append each document to form data
        documents.forEach((doc, index) => {
          if (doc.file) {
            formData.append(`documents[${index}][file]`, doc.file);
          }
          formData.append(`documents[${index}][document_type]`, doc.document_type);
          if (doc.expires_at) {
            formData.append(`documents[${index}][expires_at]`, doc.expires_at);
          }
        });
        
        await apiClient.post(
          `/marketplace/vendors/wingas/${id}/documents`, 
          formData, 
          {
            ...headers,
            'Content-Type': 'multipart/form-data'
          }
        );
        */
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to upload documents';
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
    }
  })
);
