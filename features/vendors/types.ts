
// We define the type directly here to avoid circular dependencies
// and then it will be used both by the schema and components
export type VendorFormValues = {
  tenant_id: string;
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
  store: {
    store_name: string;
    store_slug: string;
    description: string;
    branding: {
      logo_url: string;
      colors: {
        primary: string;
        secondary: string;
        accent: string;
        text: string;
        background: string;
      }
    }
  };
  commission_rate?: string;
  verification_documents?: Array<{
    document_type: string;
    document_url: string;
    verification_status: "pending" | "approved" | "rejected";
    rejection_reason?: string;
    document_id?: string;
    submitted_at?: string;
    verified_at?: string;
  }>;
};

// Generic API response type
export interface ApiResponse<T> {
  status: number;
  success: boolean;
  message?: string;
  data: T;
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
  document_id: string;
  document_type: string;
  document_url: string;
  verification_status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  submitted_at?: string;
  verified_at?: string;
};

// Store Branding Type
export type StoreBranding = {
  logo_url: string;
  favicon_url?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  font_family?: string;
  slogan?: string;
  about_html?: string;
  facebook_url?: string;
  instagram_handle?: string;
  twitter_handle?: string;
  youtube_url?: string;
};

// Store Banner Type
export type StoreBanner = {
  id?: string;
  title: string;
  image_url: string;
  mobile_image_url?: string;
  destination_url?: string;
  alt_text: string;
  display_order: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
};

// Store Type
export type Store = {
  id?: string;
  vendor_id?: string;
  store_name: string;
  store_slug: string;
  description: string;
  branding: StoreBranding;
  banners?: StoreBanner[];
  created_at?: string;
  updated_at?: string;
};

// Vendor Type
export type Vendor = {
  _id?: string;
  id?: string; // Keep for backward compatibility
  vendor_id?: string;
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
  bank_account: BankAccount;
  verification_documents?: VerificationDocument[];
  verification_status?: "pending" | "approved" | "rejected";
  commission_rate?: string;
  is_active?: boolean;
  rating?: number;
  approved_at?: string;
  store?: Store;
  created_at?: string;
  updated_at?: string;
};

// Error Type
export type VendorError = {
  status?: number;
  message: string;
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
  | 'updateBranding'
  | 'addBanner'
  | 'deleteBanner'
  | 'uploadKyc'
  | 'activate'
  | 'deactivate';
