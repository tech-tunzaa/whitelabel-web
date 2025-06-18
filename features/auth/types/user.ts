// API action types for store state management
export type UserAction = 'fetchOne' | 'fetchMany' | 'create' | 'update' | 'delete' | null;

// Error type for store error handling
export interface UserError {
  action?: UserAction;
  message: string;
  status?: number;
}

// Filter type for query parameters
export interface UserFilter {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
  sort_by?: string;
  order?: 'asc' | 'desc';
  [key: string]: any;
}

// List response type for paginated results
export interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

// User profile data structure from API
export interface UserProfile {
  profileId: string;
  role: string;
  displayName: string;
}

// User type based on API response structure
export interface User {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  activeProfileRole?: string;
  active_profile_role?: string;
  profiles?: UserProfile[];
  is_active?: boolean;
  is_verified?: boolean;
  tenant_id?: string;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
  name?: string; // Computed field (first_name + last_name)
  roles?: { role: string; description: string }[];
}

export type UserRole = 'super' | 'admin' | 'sub_admin' | 'support' | 'vendor' | 'buyer';
