// Types for loan providers
export type LoanProviderFormValues = {
  tenant_id: string;
  name: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  website?: string;
  address?: string;
  is_active: boolean;
  integration_key?: string;
  integration_secret?: string;
  // For responses/edit forms when we have a provider ID
  provider_id?: string;
  id?: string;
};

// Generic API response type
export interface ApiResponse<T> {
  status: number;
  success: boolean;
  message?: string;
  data: T;
}

// Loan Provider entity type
export type LoanProvider = {
  _id?: string;
  id?: string;
  provider_id: string;
  tenant_id: string;
  name: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  website?: string;
  address?: string;
  is_active: boolean;
  integration_key?: string;
  integration_secret?: string;
  created_at?: string;
  updated_at?: string;
};

// Error Type
export type LoanProviderError = {
  status?: number;
  message: string;
};

// List Response Types
export type LoanProviderListResponse = {
  items: LoanProvider[];
  total: number;
  skip: number;
  limit: number;
};

// API Raw Response type that matches the actual API response format
export interface LoanProviderApiResponse {
  items: LoanProvider[];
  total: number;
  skip: number;
  limit: number;
}

// Filter Types
export interface LoanProviderFilter {
  skip?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
}

// Action Types
export type LoanProviderAction = 
  | 'fetchList'
  | 'fetchOne'
  | 'create'
  | 'update'
  | 'updateStatus';
