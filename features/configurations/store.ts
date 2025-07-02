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
  fetchEntityConfiguration: (entityName: string, tenantId: string) => Promise<void>;
  fetchVehicleTypes: (tenantId: string) => Promise<void>;
  createDocumentType: (tenantId: string, data: { name: string; description: string; metadata: any }) => Promise<DocumentType | null>;
  saveEntityConfiguration: (entityName: string, tenantId: string, data: { document_types: { document_type_id: string; is_required: boolean }[] }) => Promise<void>;
  createVehicleType: (tenantId: string, data: { name: string; description: string; is_active: boolean }) => Promise<void>;
  updateVehicleType: (vehicleTypeId: string, data: Partial<VehicleType>) => Promise<void>;
  deleteVehicleType: (vehicleTypeId: string) => Promise<void>;
}

export const useConfigurationStore = create<ConfigurationState>((set, get) => ({
  configurations: {},
  vehicleTypes: [],
  loading: false,
    error: null,

  fetchEntityConfiguration: async (entityName: string, tenantId: string) => {
    console.log(`[ConfigurationStore] Attempting to fetch configuration for entity: ${entityName}`);
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
      const response = await apiClient.get<ApiResponse<VehicleType[]>>(`/configuration/vehicle-types?tenant_id=${tenantId}`);
      const vehicleTypes = response.data.data || [];
      set({ vehicleTypes, loading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
      set({ error: errorMessage, loading: false });
      toast.error(`Failed to load vehicle types: ${errorMessage}`);
    }
  },

  saveEntityConfiguration: async (entityName, tenantId, data) => {
    set({ loading: true, error: null });
    try {
      await apiClient.put(`/configuration/entities/${entityName}?tenant_id=${tenantId}`, data);
      // Refetch the configuration to get the updated, populated data
      await get().fetchEntityConfiguration(entityName, tenantId);
      toast.success(`${entityName} configuration saved successfully.`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
      set({ error: errorMessage, loading: false });
      toast.error(`Failed to save ${entityName} configuration: ${errorMessage}`);
      throw error; // Re-throw to be caught by the calling function
    }
  },

  createDocumentType: async (tenantId, data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post<ApiResponse<DocumentType>>(`/configuration/document-types?tenant_id=${tenantId}`, data);
      const newDocType = response.data.data;
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
      const response = await apiClient.post<ApiResponse<VehicleType>>(`/configuration/vehicle-types?tenant_id=${tenantId}`, data);
      const newVehicleType = response.data.data;
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

  updateVehicleType: async (vehicleTypeId: string, data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.put<ApiResponse<VehicleType>>(`/configuration/vehicle-types/${vehicleTypeId}`, data);
      const updatedVehicleType = response.data.data;
      if (updatedVehicleType) {
        set((state) => ({
          vehicleTypes: state.vehicleTypes.map((vt) => vt.id === vehicleTypeId ? updatedVehicleType : vt),
          loading: false,
        }));
        toast.success('Vehicle type updated successfully.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
      set({ error: errorMessage, loading: false });
      toast.error(`Failed to update vehicle type: ${errorMessage}`);
    }
  },

  deleteVehicleType: async (vehicleTypeId: string) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/configuration/vehicle-types/${vehicleTypeId}`);
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

}));
