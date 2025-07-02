import { create } from 'zustand';
import { apiClient } from "@/lib/api/client";
import { toast } from 'sonner';
import { EntityConfiguration } from './types';
import { ApiResponse } from '@/lib/core/api';

interface ConfigurationState {
  configurations: Record<string, EntityConfiguration>;
  loading: boolean;
  error: string | null;
  fetchEntityConfiguration: (entityName: string, tenantId: string) => Promise<void>;
}

export const useConfigurationStore = create<ConfigurationState>((set, get) => ({
  configurations: {},
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
}));
