// We define the type directly here to avoid circular dependencies
// and then it will be used both by the schema and components
export type VendorFormValues = {
  tenant_id: string;
  business_name: string;
  display_name: string;
  contact_email: string;
  contact_phone: string;
  website?: string;
  policy?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  coordinates?: [number, number] | null;
  tax_id?: string;
  commission_rate: string;
  bank_account: {
    bank_name: string;
    account_number: string;
    account_name: string;
    swift_bic?: string;
    branch_code?: string;
  };
  store: {
    store_name: string;
    store_slug: string;
    description: string;
    logo_url?: string;
    banners: StoreBanner[];
    categories: string[];
    return_policy?: string;
    shipping_policy?: string;
    general_policy?: string;
  };
  verification_documents: VerificationDocument[];
  user?: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    password: string;
    access_token?: string | null;
  };
  // For responses/edit forms when we have a vendor ID
  vendor_id?: string;
  id?: string;
};

// Generic API response type
export interface ApiResponse<T> {
  status: number;
  success: boolean;
  message?: string;
  data: T;
  items?: T[];
  total?: number;
  skip?: number;
  limit?: number;
}

// Bank Account Type
export type BankAccount = {
  bank_name: string;
  account_number: string;
  account_name: string;
  swift_code: string;
  branch_code: string;
};

// Verification Document Type
export type VerificationDocument = {
  id?: string;                                      // Internal ID (not sent to API)
  document_id?: string;                             // For existing documents from API
  document_type: string;                            // REQUIRED: Type of document
  document_url: string;                             // REQUIRED: URL to the document
  file_name?: string;                              // Optional: For display purposes only
  file_size?: number;                              // Optional: Size in bytes
  mime_type?: string;                              // Optional: MIME type
  expires_at?: string;                             // Optional: Expiration date
  verification_status?: "pending" | "approved" | "rejected" | string; // Status - accept string for API responses
  rejection_reason?: string;                       // Reason if rejected
  submitted_at?: string;                           // When document was submitted
  verified_at?: string;                            // When document was verified
  file?: File;                                     // File object for upload (not sent to API)
  file_id?: string;                                // Internal file ID
  expiry_date?: string;                            // Alternative field name for expires_at
};

// Store Banner Type
export type StoreBanner = {
  title: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
};

// Store Branding Type
export type StoreBranding = {
  store_name: string;
  store_slug: string;
  description: string;
  logo_url?: string;
};

// Store Type
export type Store = {
  id?: string;
  _id?: string;
  vendor_id?: string;
  store_name: string;
  store_slug: string;
  description: string;
  logo_url?: string;
  banners?: StoreBanner[];
  categories?: string[];
  featured_categories?: string[];
  seo_keywords?: string[];
  return_policy?: string;
  shipping_policy?: string;
  general_policy?: string;
  created_at?: string;
  updated_at?: string;
};

// Vendor entity type
export type Vendor = {
  _id?: string;
  id?: string;
  vendor_id: string;
  tenant_id: string;
  user_id?: string;
  business_name: string;
  display_name: string;
  contact_email: string;
  contact_phone: string;
  website?: string;
  policy?: string;
  logo?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  coordinates?: [number, number] | null;
  tax_id?: string;
  categories?: string[];
  commission_rate?: number | string;
  bank_account?: {
    bank_name: string;
    account_number: string;
    account_name: string;
    swift_bic?: string;
    branch_code?: string;
  };
  verification_documents?: VerificationDocument[];
  verification_status: "pending" | "approved" | "rejected" | string;
  rejection_reason?: string;
  is_active: boolean;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
  approved_at?: string;
  // Support store property for form handling
  store?: Store;
};

// Error Type
export type VendorError = {
  status?: number;
  message: string;
  action?: string;
};

// List Response Types
export type VendorListResponse = {
  items: Array<{
    _id: string;
    vendor_id: string;
    tenant_id: string;
    user_id: string;
    business_name: string;
    display_name: string;
    contact_email: string;
    contact_phone: string;
    website?: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state_province: string;
    postal_code: string;
    country: string;
    tax_id: string;
    bank_account: {
      bank_name: string;
      account_number: string;
      account_name: string;
      swift_code?: string;
      branch_code?: string;
    };
    verification_documents?: Array<{
      document_id: string;
      document_type: string;
      document_url: string;
      verification_status: string;
      rejection_reason?: string;
      submitted_at: string;
      verified_at?: string;
    }>;
    verification_status: string;
    is_active: boolean;
    commission_rate?: string;
    rating: number;
    created_at: string;
    updated_at: string;
    approved_at?: string;
  }>;
  total: number;
  skip: number;
  limit: number;
};

// API Raw Response type that matches the actual API response format
export type VendorApiResponse = {
  items: Array<{
    _id: string;
    vendor_id: string;
    tenant_id: string;
    user_id: string;
    business_name: string;
    display_name: string;
    contact_email: string;
    contact_phone: string;
    website?: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state_province: string;
    postal_code: string;
    country: string;
    tax_id: string;
    bank_account: {
      bank_name: string;
      account_number: string;
      account_name: string;
      swift_code?: string;
      branch_code?: string;
    };
    verification_documents?: Array<{
      document_id: string;
      document_type: string;
      document_url: string;
      verification_status: string;
      rejection_reason?: string;
      submitted_at: string;
      verified_at?: string;
    }>;
    verification_status: string;
    is_active: boolean;
    commission_rate?: string;
    rating: number;
    created_at: string;
    updated_at: string;
    approved_at?: string;
  }>;
  total: number;
  skip: number;
  limit: number;
};

// Filter Types
export type VendorFilter = {
  skip?: number;
  limit?: number;
  search?: string;
  verification_status?: string;
  is_active?: boolean;
};

// Action Types
export type VendorAction =
  | 'fetch'
  | 'fetchOne'
  | 'fetchByUser'
  | 'fetchList'
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'updateStatus'
  | 'uploadDocuments'
  | 'fetchStore'
  | 'createStore'
  | 'updateStore'
  | 'updateStoreBranding'
  | 'addStoreBanner'
  | 'deleteStoreBanner'
  | 'uploadKyc'
  | 'activate'
  | 'deactivate';
