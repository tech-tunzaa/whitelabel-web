import { create } from 'zustand';
import {
  Tenant,
  TenantFilter,
  TenantListResponse,
  TenantAction,
  TenantError,
  BillingDashboardMetrics,
  BillingConfig,
  Invoice,
  InvoiceListResponse as InvoiceListResponseType,
} from "./types";
import { apiClient } from '@/lib/api/client';
import { toast } from "sonner";

interface TenantStore {
  tenants: Tenant[];
  tenant: Tenant | null;
  billingDashboardMetrics: BillingDashboardMetrics | null;
  billingConfig: BillingConfig | null;
  invoices: Invoice[];
  invoicesTotal: number;
  selectedInvoice: Invoice | null;
  loadingSelectedInvoice: boolean;
  loading: boolean;
  loadingBillingConfig: boolean;
  loadingInvoices: boolean;
  isUpdating: boolean;
  storeError: TenantError | null;
  billingConfigError: TenantError | null;
  invoicesError: TenantError | null;
  activeAction: TenantAction | null;
  setActiveAction: (action: TenantAction | null) => void;
  setLoading: (loading: boolean) => void;
  setStoreError: (error: TenantError | null) => void;
  setTenant: (tenant: Tenant) => void;
  setTenants: (tenants: Tenant[]) => void;
  fetchTenant: (id: string) => Promise<Tenant>;
  fetchTenants: (filter?: TenantFilter) => Promise<TenantListResponse>;
  fetchBillingDashboardMetrics: () => Promise<void>;
  fetchBillingConfig: (tenantId: string) => Promise<void>;
  fetchInvoices: (params: {
    tenantId: string;
    status?: string;
    skip?: number;
    limit?: number;
  }) => Promise<void>;
  generateInvoices: (tenantId: string) => Promise<void>;
  fetchInvoiceDetails: (invoiceId: string) => Promise<void>;
  clearSelectedInvoice: () => void;
  createTenant: (data: Partial<Tenant>) => Promise<Tenant>;
  updateTenant: (id: string, data: Partial<Tenant>) => Promise<Tenant>;
  deactivateTenant: (id: string) => Promise<void>;
}

export const useTenantStore = create<TenantStore>()(
  (set, get) => ({
      tenants: [],
      tenant: null,
      billingDashboardMetrics: null,
      billingConfig: null,
      invoices: [],
      invoicesTotal: 0,
      selectedInvoice: null,
      loadingSelectedInvoice: false,
      loading: true,
      loadingBillingConfig: false,
      loadingInvoices: false,
      isUpdating: false,
      storeError: null,
      billingConfigError: null,
      invoicesError: null,
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



      // Tenant Billing APIs
      fetchBillingDashboardMetrics: async () => {
        const { setLoading, setStoreError } = get();
        try {
          setLoading(true);
          const response = await apiClient.get<BillingDashboardMetrics>('/billing/dashboard');
          if (response.data) {
            set({ billingDashboardMetrics: response.data });
          }
        } catch (error) {
          setStoreError({
            message:
              error instanceof Error ? error.message : 'Failed to fetch billing dashboard metrics',
            status: error.response?.status,
          });
        } finally {
          setLoading(false);
        }
      },

      

      fetchBillingConfig: async (tenantId: string) => {
        set({ loadingBillingConfig: true, storeError: null });
        try {
          const response = await apiClient.get<BillingConfig>(
            `/billing/config/${tenantId}`
          );
          if (response.data) {
            set({ billingConfig: response.data, loadingBillingConfig: false });
          } else {
            set({ billingConfig: null, loadingBillingConfig: false });
          }
        } catch (error: any) {
          const errorMsg =
            error.response?.data?.message || "Failed to fetch billing configuration.";
          if (error.response?.status !== 404) {
            toast.error(errorMsg);
          }
          set({
            billingConfig: null,
            billingConfigError: { status: error.response?.status, message: errorMsg },
            loadingBillingConfig: false,
          });
        }
      },
    
      fetchInvoices: async (params) => {
        const { tenantId, status, skip = 0, limit = 10 } = params;
        set({ loadingInvoices: true, storeError: null });
        try {
          const queryParams = new URLSearchParams({
            tenant_id: tenantId,
            skip: skip.toString(),
            limit: limit.toString(),
          });
          if (status && status !== "all") {
            queryParams.append("status", status);
          }
          const response = await apiClient.get<InvoiceListResponseType>(
            `/billing/invoices?${queryParams.toString()}`
          );
          const data = response.data;
          if (data && Array.isArray(data.items)) {
            set({
              invoices: data.items,
              invoicesTotal: data.total || 0,
              loadingInvoices: false,
            });
          } else {
            // Handle cases where response is not the expected shape
            set({ invoices: [], invoicesTotal: 0, loadingInvoices: false });
          }
        } catch (error: any) {
          const errorMsg = error.response?.data?.message || "Failed to fetch invoices.";
          toast.error(errorMsg);
          set({
            invoicesError: { status: error.response?.status, message: errorMsg },
            loadingInvoices: false,
          });
        }
      },
    
      generateInvoices: async (tenantId: string) => {
        set({ isUpdating: true });
        try {
          await apiClient.post("/billing/invoices/generate", { tenant_id: tenantId });
          toast.success("Invoice generation process started successfully.");
          setTimeout(() => get().fetchInvoices({ tenantId, status: 'pending' }), 2000);
        } catch (error: any) {
          let errorMsg = "Failed to generate invoice. Please try again later.";
          if (error.response?.status === 409) {
            errorMsg = error.response?.data?.detail || "Invoice already exists for this billing period.";
          } else if (error.response?.data?.detail) {
            errorMsg = error.response.data.detail;
          }

          if (error.response?.status >= 500) {
            toast.error("An unexpected server error occurred.");
          } else {
            toast.error(errorMsg);
          }

          set({
            storeError: { status: error.response?.status, message: errorMsg },
          });
        } finally {
          set({ isUpdating: false });
        }
      },

      fetchInvoiceDetails: async (invoiceId: string) => {
        set({ loadingSelectedInvoice: true });
        try {
          const response = await apiClient.get<{ data: Invoice }>(`/billing/invoices/${invoiceId}`);
          set({ selectedInvoice: response.data, loadingSelectedInvoice: false });
        } catch (error) {
          toast.error("Failed to fetch invoice details.");
          set({ selectedInvoice: null, loadingSelectedInvoice: false });
        }
      },

      clearSelectedInvoice: () => {
        set({ selectedInvoice: null });
      },

      createBillingConfig: async (billingConfigData: any) => {
        set({ loadingBillingConfig: true, storeError: null });
        try {
          const response = await apiClient.post<BillingConfig>(
            `/billing/config`,
            billingConfigData
          );
          if (response.data) {
            set({ billingConfig: response.data, loadingBillingConfig: false });
            toast.success("Billing configuration created successfully!");
            return response.data;
          }
        } catch (error: any) {
          const errorMsg =
            error.response?.data?.message || "Failed to create billing configuration.";
          toast.error(errorMsg);
          set({
            billingConfigError: { status: error.response?.status, message: errorMsg },
            loadingBillingConfig: false,
          });
          throw error;
        }
      },

      updateBillingConfig: async (tenantId: string, billingConfigData: any) => {
        set({ loadingBillingConfig: true, storeError: null });
        try {
          const response = await apiClient.put<BillingConfig>(
            `/billing/config/${tenantId}`,
            billingConfigData
          );
          if (response.data) {
            set({ billingConfig: response.data, loadingBillingConfig: false });
            toast.success("Billing configuration updated successfully!");
            return response.data;
          }
        } catch (error: any) {
          const errorMsg =
            error.response?.data?.message || "Failed to update billing configuration.";
          toast.error(errorMsg);
          set({
            billingConfigError: { status: error.response?.status, message: errorMsg },
            loadingBillingConfig: false,
          });
          throw error;
        }
      },
    })
);