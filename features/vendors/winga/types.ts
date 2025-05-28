// Types for Winga (Vendor Affiliates)
// We define the type directly here to avoid circular dependencies
// and then it will be used both by the schema and components

// Generic API response type
export interface ApiResponse<T> {
  status: number;
  success: boolean;
  message?: string;
  data: T;
}

export type WingaFormValues = {
  tenant_id: string;
  vendor_id: string;
  affiliate_name: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  website?: string;
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
  verification_documents: VerificationDocument[];
  // For responses/edit forms when we have a winga ID
  winga_id?: string;
  id?: string;
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
  verification_status?: "pending" | "approved" | "rejected"; // Status
  rejection_reason?: string;                       // Reason if rejected
  submitted_at?: string;                           // When document was submitted
  verified_at?: string;                            // When document was verified
  file?: File;                                     // File object for upload (not sent to API)
  file_id?: string;                                // Internal file ID
};

// Winga (Vendor Affiliate) entity type
export type Winga = {
  _id?: string;
  id?: string;
  winga_id: string;
  tenant_id: string;
  vendor_id: string;
  affiliate_name: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  website?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  coordinates?: [number, number] | null;
  tax_id?: string;
  commission_rate?: number | string;
  bank_account?: {
    bank_name: string;
    account_number: string;
    account_name: string;
    swift_bic?: string;
    branch_code?: string;
  };
  verification_documents?: VerificationDocument[];
  verification_status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  is_active: boolean;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
  approved_at?: string;
};

// Error Type
export type WingaError = {
  status?: number;
  message: string;
};

// List Response Types
export type WingaListResponse = {
  items: Array<{
    _id: string;
    winga_id: string;
    tenant_id: string;
    vendor_id: string;
    affiliate_name: string;
    contact_person: string;
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
    created_at: string;
    updated_at: string;
    approved_at?: string;
  }>;
  total: number;
  skip: number;
  limit: number;
};

// Filter Types
export type WingaFilter = {
  skip?: number;
  limit?: number;
  search?: string;
  verification_status?: string;
  is_active?: boolean;
  vendor_id?: string;
};

// Action Types
export type WingaAction =
  | 'fetch'
  | 'fetchOne'
  | 'fetchByVendor'
  | 'fetchList'
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'updateStatus'
  | 'uploadDocuments'
  | 'uploadKyc'
  | 'activate'
  | 'deactivate';
