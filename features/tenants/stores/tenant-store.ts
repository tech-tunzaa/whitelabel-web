import { create } from "zustand";
import { Tenant } from "../types/tenant";
import { mockTenants } from "../data/tenants";

interface TenantStore {
  tenants: Tenant[];
  selectedTenant: Tenant | null;
  searchQuery: string;
  
  // Actions
  setTenants: (tenants: Tenant[]) => void;
  selectTenant: (tenant: Tenant | null) => void;
  setSearchQuery: (query: string) => void;
  addTenant: (tenant: Tenant) => void;
  updateTenant: (updatedTenant: Tenant) => void;
  deleteTenant: (tenantId: string) => void;
  updateTenantStatus: (tenantId: string, status: "active" | "inactive" | "pending") => void;
  
  // Getters
  getFilteredTenants: () => Tenant[];
}

export const useTenantStore = create<TenantStore>((set, get) => ({
  tenants: mockTenants,
  selectedTenant: null,
  searchQuery: "",
  
  setTenants: (tenants) => set({ tenants }),
  selectTenant: (tenant) => set({ selectedTenant: tenant }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  addTenant: (tenant) => {
    set((state) => ({
      tenants: [...state.tenants, tenant],
    }));
  },
  
  updateTenant: (updatedTenant) => {
    set((state) => ({
      tenants: state.tenants.map((tenant) =>
        tenant.id === updatedTenant.id ? updatedTenant : tenant
      ),
      selectedTenant:
        state.selectedTenant?.id === updatedTenant.id
          ? updatedTenant
          : state.selectedTenant,
    }));
  },
  
  deleteTenant: (tenantId) => {
    set((state) => ({
      tenants: state.tenants.filter((tenant) => tenant.id !== tenantId),
      selectedTenant:
        state.selectedTenant?.id === tenantId ? null : state.selectedTenant,
    }));
  },
  
  updateTenantStatus: (tenantId, status) => {
    set((state) => ({
      tenants: state.tenants.map((tenant) =>
        tenant.id === tenantId ? { ...tenant, status } : tenant
      ),
      selectedTenant:
        state.selectedTenant?.id === tenantId
          ? { ...state.selectedTenant, status }
          : state.selectedTenant,
    }));
  },
  
  getFilteredTenants: () => {
    const { tenants, searchQuery } = get();
    if (!searchQuery) return tenants;
    
    return tenants.filter(
      (tenant) =>
        tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.admin_email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  },
}));
