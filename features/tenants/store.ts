import { create } from 'zustand';
import { Tenant, TenantFilter, TenantListResponse, TenantAction, TenantError } from './types';
import { apiClient } from '@/lib/api/client';

interface TenantStore {
  tenants: Tenant[];
  tenant: Tenant | null;
  loading: boolean;
  storeError: TenantError | null;
  activeAction: TenantAction | null;
  setActiveAction: (action: TenantAction | null) => void;
  setLoading: (loading: boolean) => void;
  setStoreError: (error: TenantError | null) => void;
  setTenant: (tenant: Tenant) => void;
  setTenants: (tenants: Tenant[]) => void;
  fetchTenant: (id: string) => Promise<Tenant>;
  fetchTenants: (filter?: TenantFilter) => Promise<TenantListResponse>;
  createTenant: (data: Partial<Tenant>) => Promise<Tenant>;
  updateTenant: (id: string, data: Partial<Tenant>) => Promise<Tenant>;
  deactivateTenant: (id: string) => Promise<void>;
}

export const useTenantStore = create<TenantStore>()(
  (set, get) => ({
      tenants: [],
      tenant: null,
      loading: true,
      storeError: null,
      activeAction: null,

      setActiveAction: (action) => set({ activeAction: action }),
      setLoading: (loading) => set({ loading }),
      setStoreError: (error) => set({ storeError: error }),
      setTenant: (tenant) => set({ tenant }),
      setTenants: (tenants) => set({ tenants }),

      fetchTenant: async (id: string) => {
        const { setActiveAction, setLoading, setStoreError, setTenant } = get();
        try {
          setActiveAction('fetch');
          setLoading(true);
          const response = await apiClient.get<Tenant>(`/tenants/${id}`);
          if (response.data) {
            setTenant(response.data);
            setLoading(false);
            return response.data;
          }
          throw new Error('Tenant not found');
        } catch (error) {
          setStoreError({
            message: error instanceof Error ? error.message : 'Failed to fetch tenant',
            status: error.response?.status,
          });
          setTenant(null);
          setLoading(false);
          throw error;
        } finally {
          setActiveAction(null);
        }
      },

      fetchTenants: async (filter: TenantFilter = {}) => {
        const { setActiveAction, setLoading, setStoreError, setTenants } = get();
        try {
          setActiveAction('fetchList');
          setLoading(true);
          const params = new URLSearchParams();
          if (filter.skip) params.append('skip', filter.skip.toString());
          if (filter.limit) params.append('limit', filter.limit.toString());
          if (filter.search) params.append('search', filter.search);
          if (filter.isActive !== undefined) params.append('isActive', filter.isActive.toString());

          const response = await apiClient.get<TenantListResponse>(`/tenants/?${params.toString()}`);
          if (response.data) {
            setTenants(response.data.items);
            return response.data;
          }
          setStoreError({ message: 'Failed to fetch tenants' });
        } catch (error) {
          setStoreError({
            message: error instanceof Error ? error.message : 'Failed to fetch tenants',
          });
          throw error;
        } finally {
          setLoading(false);
          setActiveAction(null);
        }
      },

      createTenant: async (data: Partial<Tenant>) => {
        const { setActiveAction, setLoading, setStoreError, setTenant } = get();
        try {
          setActiveAction('create');
          setLoading(true);
          const response = await apiClient.post<Tenant>('/tenants/', data);
          if (response.data) {
            setTenant(response.data);
            return response.data;
          }
          setStoreError({ message: 'Failed to create tenant' });
        } catch (error) {
          setStoreError({
            message: error instanceof Error ? error.message : 'Failed to create tenant',
          });
          throw error;
        } finally {
          setLoading(false);
          setActiveAction(null);
        }
      },

      updateTenant: async (id: string, data: Partial<Tenant>) => {
        const { setActiveAction, setLoading, setStoreError, setTenant } = get();
        try {
          setActiveAction('update');
          setLoading(true);
          const response = await apiClient.put<Tenant>(`/tenants/${id}`, data);
          if (response.data) {
            setTenant(response.data);
            return response.data;
          }
          setStoreError({ message: 'Failed to update tenant' });
        } catch (error) {
          setStoreError({
            message: error instanceof Error ? error.message : 'Failed to update tenant',
          });
          throw error;
        } finally {
          setLoading(false);
          setActiveAction(null);
        }
      },

      deactivateTenant: async (id: string) => {
        const { setActiveAction, setLoading, setStoreError } = get();
        try {
          setActiveAction('deactivate');
          setLoading(true);
          await apiClient.put(`/tenants/${id}/deactivate`);
        } catch (error) {
          setStoreError({
            message: error instanceof Error ? error.message : 'Failed to deactivate tenant',
          });
          throw error;
        } finally {
          setLoading(false);
          setActiveAction(null);
        }
      },
    })
);
