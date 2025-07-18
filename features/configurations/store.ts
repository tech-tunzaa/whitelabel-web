import { create } from 'zustand';
import { apiClient } from "@/lib/api/client";
import { toast } from 'sonner';
import { DocumentType, EntityConfiguration, VehicleType } from './types';
import { ApiResponse } from '@/lib/core/api';

interface ConfigurationState {
  vehicleTypes: VehicleType[];
  configurations: Record<string, EntityConfiguration>;
  loading: boolean;
  error: string | null;
  fetchDocumentTypes: (tenantId: string) => Promise<DocumentType[]>;
  fetchEntities: (tenantId: string) => Promise<any[]>;
  fetchEntityConfiguration: (entityName: string, tenantId: string) => Promise<void>;
  fetchVehicleTypes: (tenantId: string) => Promise<void>;
  createDocumentType: (tenantId: string, data: { name: string; description: string; metadata: any }) => Promise<DocumentType | null>;
  saveEntityConfiguration: (entityName: string, tenantId: string, data: { document_types: { document_type_id: string; is_required: boolean }[] }, mode: 'create' | 'update') => Promise<void>;
  createVehicleType: (tenantId: string, data: { name: string; description: string; is_active: boolean }) => Promise<void>;
  updateVehicleType: (vehicleTypeId: string, data: Partial<VehicleType>) => Promise<void>;
  deleteVehicleType: (vehicleTypeId: string, tenantId: string) => Promise<void>;
}

export const useConfigurationStore = create<ConfigurationState>((set, get) => ({
  configurations: {},
  vehicleTypes: [],
  loading: false,
  error: null,

  // Fetch all document types for a tenant
  fetchDocumentTypes: async (tenantId: string): Promise<DocumentType[]> => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get(`/configuration/document-types?tenant_id=${tenantId}`);
      let items: DocumentType[] = [];
      if (response.data && typeof response.data === 'object') {
        if ('success' in response.data && response.data.success && response.data.data && Array.isArray(response.data.data.items)) {
          items = response.data.data.items;
        } else if ('items' in response.data && Array.isArray(response.data.items)) {
          items = response.data.items;
        }
      }
      set({ loading: false });
      return items;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
      set({ error: errorMessage, loading: false });
      toast.error(`Failed to fetch document types: ${errorMessage}`);
      return [];
    }
  },

  fetchEntityConfiguration: async (entityName: string, tenantId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get<ApiResponse<EntityConfiguration>>(
        `/configuration/entities/${entityName}?tenant_id=${tenantId}`
      );

      let newConfig: EntityConfiguration | undefined;
      if ((response.data as any).success !== undefined) {
        // API wrapped response
        const wrapped = response.data as ApiResponse<EntityConfiguration>;
        if (wrapped.success) {
          newConfig = wrapped.data;
        } else {
          throw new Error(wrapped.message || 'Failed to fetch configuration');
        }
      } else {
        // Direct entity configuration object
        newConfig = response.data as unknown as EntityConfiguration;
      }

      if (!newConfig) {
        throw new Error('Configuration data missing in response');
      }

      set((state) => ({
        configurations: {
          ...state.configurations,
          [entityName]: newConfig,
        },
        loading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
      set({ error: errorMessage, loading: false });
      toast.error(`Failed to load ${entityName} configuration: ${errorMessage}`);
    }
  },

  fetchVehicleTypes: async (tenantId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get<ApiResponse<{ items: any[] }>>(`/configuration/vehicle-types?tenant_id=${tenantId}`);
      const vehicleTypes: VehicleType[] = (response.data.items || []).map((vt: any) => ({
        ...vt,
        id: vt.vehicle_id || vt.id, // ensure id is present
      }));
      set({ vehicleTypes, loading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
      set({ error: errorMessage, loading: false });
      toast.error(`Failed to load vehicle types: ${errorMessage}`);
    }
  },

  saveEntityConfiguration: async (entityName, tenantId, data, mode: 'create' | 'update') => {
    set({ loading: true, error: null });
    try {
      if (mode === 'update') {
        await apiClient.put(`/configuration/entities/${entityName}`, { ...data, tenant_id: tenantId });
        // await get().fetchEntityConfiguration(entityName, tenantId);
        toast.success(`${entityName} configuration updated successfully.`);
      } else if (mode === 'create') {
        await apiClient.post(`/configuration/entities`, { ...data, name: entityName, tenant_id: tenantId });
        // await get().fetchEntityConfiguration(entityName, tenantId);
        toast.success(`${entityName} configuration created successfully.`);
      } else {
        throw new Error('Invalid mode for saveEntityConfiguration');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
      set({ error: errorMessage, loading: false });
      toast.error(`Failed to save ${entityName} configuration: ${errorMessage}`);
      throw error;
    }
    set({ loading: false });
  },

  createDocumentType: async (tenantId, data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post<ApiResponse<DocumentType>>(`/configuration/document-types`, { ...data, tenant_id: tenantId });
      const newDocType = response.data.data as DocumentType;
      if (newDocType) {
        toast.success(`Document type '${data.name}' created.`);
        return newDocType;
      }
      return null;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
      set({ error: errorMessage, loading: false });
      toast.error(`Failed to create document type: ${errorMessage}`);
      return null;
    }
  },

  createVehicleType: async (tenantId: string, data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post<ApiResponse<VehicleType>>(`/configuration/vehicle-types`, { ...data, tenant_id: tenantId });
      const newVehicleType = response.data.data as VehicleType;
      if (newVehicleType) {
        set((state) => ({ vehicleTypes: [...state.vehicleTypes, newVehicleType], loading: false }));
        toast.success('Vehicle type created successfully.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
      set({ error: errorMessage, loading: false });
      toast.error(`Failed to create vehicle type: ${errorMessage}`);
    }
  },

  updateVehicleType: async (vehicleTypeId: string, data: Partial<VehicleType>) => {
    set({ loading: true, error: null });
    try {
      // Always include tenant_id in the payload
      let tenant_id = data.tenant_id;
      if (!tenant_id) {
        // Try to get tenant_id from the current vehicleType in store
        const vt = (get().vehicleTypes || []).find(v => v.id === vehicleTypeId);
        tenant_id = vt?.tenant_id;
      }
      await apiClient.put(`/configuration/vehicle-types/${vehicleTypeId}`, { ...data, tenant_id });
      set((state) => ({
        vehicleTypes: state.vehicleTypes.map((vt) => vt.id === vehicleTypeId ? { ...vt, ...data } : vt),
        loading: false,
      }));
      toast.success('Vehicle type updated successfully.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
      set({ error: errorMessage, loading: false });
      toast.error(`Failed to update vehicle type: ${errorMessage}`);
    }
  },

  deleteVehicleType: async (vehicleTypeId: string, tenantId: string) => {
    set({ loading: true, error: null });
    try {
      // Use axios directly to send a body with DELETE
      await apiClient.delete(`/configuration/vehicle-types/${vehicleTypeId}`, { tenant_id: tenantId });
      set((state) => ({
        vehicleTypes: state.vehicleTypes.filter((vt) => vt.id !== vehicleTypeId),
        loading: false,
      }));
      toast.success('Vehicle type deleted successfully.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
      set({ error: errorMessage, loading: false });
      toast.error(`Failed to delete vehicle type: ${errorMessage}`);
    }
  },

  // Fetch all entity configurations for a tenant
  fetchEntities: async (tenantId: string): Promise<any[]> => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get(`/configuration/entities?tenant_id=${tenantId}`);
      // Assume response.data.items is the array of entities
      const items = response.data.items || [];
      set({ loading: false });
      return items;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
      set({ error: errorMessage, loading: false });
      toast.error(`Failed to fetch entities: ${errorMessage}`);
      return [];
    }
  },
}));
