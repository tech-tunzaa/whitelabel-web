// Types for loan products
export type LoanProductFormValues = {
  tenant_id: string;
  provider_id: string;
  name: string;
  description: string;
  interest_rate: string;
  term_options: number[]; // Available terms in months
  payment_frequency: 'weekly' | 'bi-weekly' | 'monthly';
  min_amount: string;
  max_amount: string;
  processing_fee?: string;
  is_active: boolean;
  // For responses/edit forms when we have a product ID
  product_id?: string;
  id?: string;
};

// Generic API response type
export interface ApiResponse<T> {
  status: number;
  success: boolean;
  message?: string;
  data: T;
}

// Loan Product entity type
export type LoanProduct = {
  _id?: string;
  id?: string;
  product_id: string;
  tenant_id: string;
  provider_id: string;
  provider_name?: string;
  name: string;
  description: string;
  interest_rate: number;
  term_options: number[]; // Available term lengths in months
  payment_frequency: 'weekly' | 'bi-weekly' | 'monthly';
  min_amount: number;
  max_amount: number;
  processing_fee?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

// Error Type
export type LoanProductError = {
  status?: number;
  message: string;
};

// List Response Types
export type LoanProductListResponse = {
  items: LoanProduct[];
  total: number;
  skip: number;
  limit: number;
};

// API Raw Response type that matches the actual API response format
export interface LoanProductApiResponse {
  items: LoanProduct[];
  total: number;
  skip: number;
  limit: number;
}

// Filter Types
export interface LoanProductFilter {
  skip?: number;
  limit?: number;
  search?: string;
  provider_id?: string;
  is_active?: boolean;
  min_interest_rate?: number;
  max_interest_rate?: number;
}

// Action Types
export type LoanProductAction = 
  | 'fetchList'
  | 'fetchOne'
  | 'create'
  | 'update'
  | 'updateStatus';
