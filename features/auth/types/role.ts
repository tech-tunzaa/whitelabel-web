// Permission interface based on API
export interface Permission {
  id: string;
  permission_id?: string; // API might use this format
  name: string;
  description?: string;
  module: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Role interface based on API, consolidated
export interface Role {
  id: string;
  role_id?: string; // API might use this format
  role: string; // Role code/slug (e.g., 'admin')
  name: string; // Display name for the UI
  display_name?: string;
  description?: string;
  permissions: string[]; // The form and API likely use an array of permission names/IDs
  is_system_role: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  tenant_id?: string;
}

export type RoleAction = 'fetchOne' | 'fetchMany' | 'create' | 'update' | 'delete' | null;

// Error type for store error handling
export interface RoleError {
  action?: RoleAction;
  message: string;
  status?: number;
}

// Filter type for query parameters
export interface RoleFilter {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  order?: 'asc' | 'desc';
  [key: string]: any;
}

// List response type for paginated results
export interface RoleListResponse {
  data: Role[];
  total: number;
  page: number;
  limit: number;
}
