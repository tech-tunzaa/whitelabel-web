import { create } from 'zustand';
import { LoanProvider, LoanProviderFilter, LoanProviderListResponse, LoanProviderAction, LoanProviderError, ApiResponse, LoanProviderFormValues } from './types';
import { apiClient } from '@/lib/api/client';
import { generateMockLoanProviders } from './data/mock-data';

interface LoanProviderStore {
  providers: LoanProvider[];
  provider: LoanProvider | null;
  loading: boolean;
  storeError: LoanProviderError | null;
  activeAction: LoanProviderAction | null;
  
  // UI State
  setActiveAction: (action: LoanProviderAction | null) => void;
  setLoading: (loading: boolean) => void;
  setStoreError: (error: LoanProviderError | null) => void;
  setProvider: (provider: LoanProvider | null) => void;
  setProviders: (providers: LoanProvider[]) => void;
  
  // API Methods
  fetchProvider: (id: string, headers?: Record<string, string>) => Promise<LoanProvider>;
  fetchProviders: (filter?: LoanProviderFilter, headers?: Record<string, string>) => Promise<LoanProviderListResponse>;
  createProvider: (data: LoanProviderFormValues, headers?: Record<string, string>) => Promise<LoanProvider>;
  updateProvider: (id: string, data: Partial<LoanProviderFormValues>, headers?: Record<string, string>) => Promise<LoanProvider>;
  updateProviderStatus: (id: string, isActive: boolean, headers?: Record<string, string>) => Promise<void>;
}

export const useLoanProviderStore = create<LoanProviderStore>()(
  (set, get) => ({
    providers: [],
    provider: null,
    loading: false,
    storeError: null,
    activeAction: null,

    setActiveAction: (action) => set({ activeAction: action }),
    setLoading: (loading) => set({ loading }),
    setStoreError: (error) => set({ storeError: error }),
    setProvider: (provider) => set({ provider }),
    setProviders: (providers) => set({ providers }),

    fetchProvider: async (id: string, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError, setProvider } = get();
      try {
        setActiveAction('fetchOne');
        setLoading(true);
        
        // For now, we'll use mock data
        // In a real implementation, this would be an API call
        // const response = await apiClient.get<ApiResponse<LoanProvider>>(`/loans/providers/${id}`, undefined, headers);
        
        // Mock implementation
        const mockProviders = generateMockLoanProviders();
        const provider = mockProviders.find(provider => provider.provider_id === id);
        
        if (provider) {
          setProvider(provider);
          setLoading(false);
          return provider;
        }
        
        throw new Error('Loan provider not found');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch loan provider';
        const errorStatus = (error as any)?.response?.status;
        setStoreError({
          message: errorMessage,
          status: errorStatus,
        });
        setProvider(null);
        setLoading(false);
        throw error;
      } finally {
        setActiveAction(null);
      }
    },

    fetchProviders: async (filter: LoanProviderFilter = {}, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError, setProviders } = get();
      try {
        setActiveAction('fetchList');
        setLoading(true);
        
        // For now, we'll use mock data
        // In a real implementation, this would be an API call
        // const response = await apiClient.get<ApiResponse<LoanProviderListResponse>>(`/loans/providers`, undefined, headers);
        
        // Mock implementation
        const mockProviders = generateMockLoanProviders();
        
        // Filter providers based on search and is_active if provided
        let filteredProviders = mockProviders;
        if (filter.search) {
          const search = filter.search.toLowerCase();
          filteredProviders = filteredProviders.filter(provider => 
            provider.name.toLowerCase().includes(search) || 
            provider.description.toLowerCase().includes(search) ||
            provider.contact_email.toLowerCase().includes(search)
          );
        }
        
        if (filter.is_active !== undefined) {
          filteredProviders = filteredProviders.filter(provider => 
            provider.is_active === filter.is_active
          );
        }
        
        // Handle pagination
        const skip = filter.skip || 0;
        const limit = filter.limit || 10;
        const paginatedProviders = filteredProviders.slice(skip, skip + limit);
        
        const providerResponse: LoanProviderListResponse = {
          items: paginatedProviders,
          total: filteredProviders.length,
          skip,
          limit
        };
        
        setProviders(paginatedProviders);
        setLoading(false);
        return providerResponse;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch loan providers';
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

    createProvider: async (data: LoanProviderFormValues, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError } = get();
      try {
        setActiveAction('create');
        setLoading(true);
        
        // For now, we'll use mock data
        // In a real implementation, this would be an API call
        // const response = await apiClient.post<ApiResponse<LoanProvider>>('/loans/providers', data, headers);
        
        // Mock implementation
        const mockProviders = generateMockLoanProviders();
        const newProvider: LoanProvider = {
          provider_id: `provider_${Date.now()}`,
          tenant_id: data.tenant_id,
          name: data.name,
          description: data.description,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          website: data.website,
          address: data.address,
          is_active: data.is_active,
          integration_key: data.integration_key,
          integration_secret: data.integration_secret,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // In a real app, this would be persisted to a database
        mockProviders.push(newProvider);
        
        setLoading(false);
        return newProvider;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create loan provider';
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

    updateProvider: async (id: string, data: Partial<LoanProviderFormValues>, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError, setProvider, providers, setProviders } = get();
      try {
        setActiveAction('update');
        setLoading(true);
        
        // For now, we'll use mock data
        // In a real implementation, this would be an API call
        // const response = await apiClient.put<ApiResponse<LoanProvider>>(`/loans/providers/${id}`, data, headers);
        
        // Mock implementation
        const mockProviders = [...providers];
        const providerIndex = mockProviders.findIndex(p => p.provider_id === id);
        
        if (providerIndex === -1) {
          throw new Error('Loan provider not found');
        }
        
        const updatedProvider = {
          ...mockProviders[providerIndex],
          ...data,
          updated_at: new Date().toISOString()
        };
        
        mockProviders[providerIndex] = updatedProvider as LoanProvider;
        setProviders(mockProviders);
        setProvider(updatedProvider as LoanProvider);
        
        setLoading(false);
        return updatedProvider as LoanProvider;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update loan provider';
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

    updateProviderStatus: async (id: string, isActive: boolean, headers?: Record<string, string>) => {
      const { setActiveAction, setLoading, setStoreError, providers, setProviders } = get();
      try {
        setActiveAction('updateStatus');
        setLoading(true);
        
        // For now, we'll use mock data
        // In a real implementation, this would be an API call
        // const response = await apiClient.patch<ApiResponse<void>>(`/loans/providers/${id}/status`, { is_active: isActive }, headers);
        
        // Mock implementation
        const mockProviders = [...providers];
        const providerIndex = mockProviders.findIndex(p => p.provider_id === id);
        
        if (providerIndex === -1) {
          throw new Error('Loan provider not found');
        }
        
        mockProviders[providerIndex] = {
          ...mockProviders[providerIndex],
          is_active: isActive,
          updated_at: new Date().toISOString()
        };
        
        setProviders(mockProviders);
        setLoading(false);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update loan provider status';
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
