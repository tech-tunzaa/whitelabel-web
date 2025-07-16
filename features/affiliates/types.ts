// Types for Winga (Vendor Affiliates)
// We define the type directly here to avoid circular dependencies
// and then it will be used both by the schema and components

// Generic API response type
import type { AffiliateFormValues as OriginalAffiliateFormValues } from './schema';

// Make AffiliateFormValues available for use within this module and for export
export type AffiliateFormValues = OriginalAffiliateFormValues;

export interface PaginationMeta {
  total: number;
  skip: number;
  limit: number;
  currentPage?: number;
  totalPages?: number;
}

// Base response type for paginated lists
type PaginatedResponse<T> = {
  total: number;
  currentPage?: number;
  items: T[];
};

export type AffiliatesApiResponseData = PaginatedResponse<Affiliate> & {
  affiliates: Affiliate[];
};

export type AffiliateRequestsApiResponseData = PaginatedResponse<AffiliateRequest> & {
  requests: AffiliateRequest[];
};

export type AffiliateRequest = {
  id: string;
  affiliate_id: string;
  request_type: string;
  vendor_id: string;
  product_id: string | null;
  status: 'pending' | 'approved' | 'rejected';
  message: string | null;
  response_message: string | null;
  created_at: string;
  updated_at: string | null;
  responded_at: string | null;
  // Joined fields
  vendor_name?: string;
  product_name?: string;
  affiliate_name?: string;
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
  status?: "pending" | "approved" | "rejected"; // Status
  rejection_reason?: string;                       // Reason if rejected
  submitted_at?: string;                           // When document was submitted
  verified_at?: string;                            // When document was verified
  file?: File;                                     // File object for upload (not sent to API)
  file_id?: string;                                // Internal file ID
};

// Affiliate (Vendor Affiliate) entity type
export type Affiliate = {
  id: string;
  tenant_id: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  user_id?: string;
  bio?: string;
  social_media?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
  bank_account?: {
    bank_name: string;
    account_number: string;
    account_name: string;
    swift_bic?: string;
    branch_code?: string;
  };
  verification_documents?: VerificationDocument[];
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  is_active: boolean;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
  approved_at?: string;
};

// Error Type
export type AffiliateError = {
  status?: number;
  message: string;
  action?: AffiliateAction;
  details?: any; // Can be refined later if a more specific error details structure emerges
};

// List Response Types
export type AffiliateListResponse = {
  items: Array<{
    id: string;
    tenant_id: string;
    user_id: string;
    name: string;
    email?: string;
    phone?: string;
    website?: string;
    bio?: string;
    status: string;
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
      status: string;
      rejection_reason?: string;
      submitted_at: string;
      verified_at?: string;
    }>;
    created_at: string;
    updated_at: string;
    approved_at?: string;
  }>;
  total: number;
  skip: number;
  limit: number;
};

// Filter Types
export type AffiliateFilter = {
  skip?: number;
  limit?: number;
  search?: string;
  status?: string;
  is_active?: boolean;
  vendor_id?: string;
};

// Action Types
export type AffiliateAction =
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
  | 'activate'
  | 'deactivate'
  | 'uploadKyc'
  | 'fetchVendorPartnerRequests'
  | 'fetchAffiliateRequests'
  | 'fetchRequests';

export type AffiliateStatus = "pending" | "approved" | "rejected";

// CreateAffiliatePayload: Based on AffiliateFormValues.
// user_id and tenant_id will be added in the store/onSubmit handler.
export type CreateAffiliatePayload = AffiliateFormValues & {
  vendor_id: string; // Added vendor_id as it's essential for creation
  user_id: string;
  tenant_id: string;
};

// UpdateAffiliatePayload: Partial of AffiliateFormValues.
export type UpdateAffiliatePayload = Partial<AffiliateFormValues>;

// Vendor Partner Request (associated with an Affiliate)
export type VendorPartnerRequestStatus = "pending" | "approved" | "rejected" | "active" | "inactive"; // Expanding based on sample and common statuses

export interface VendorPartnerRequest {
  vendor_id: string;
  vendor_name: string;
  joined_at: string; // ISO date string
  commission_rate: number;
  status: VendorPartnerRequestStatus;
  // Add any other fields that the API might return for a vendor partner request
  // For example:
  // requested_by_affiliate_id?: string; // If the API includes this
  // vendor_contact_email?: string;
  // vendor_contact_phone?: string;
}

export type VendorPartnerRequestsApiResponseData = {
  requests: VendorPartnerRequest[]; // Assuming the API returns an array of requests
  total: number;
  currentPage?: number;
  // Potentially other pagination fields if the API returns them directly in `data`
};

// You might also want a filter type for these requests if needed later
export type VendorPartnerRequestFilter = {
  skip?: number;
  limit?: number;
  status?: VendorPartnerRequestStatus;
  // any other filterable fields
};

// Affiliate Link Type
export type AffiliateLink = {
  id: string;
  affiliate_id: string;
  request_id: string;
  code: string;
  vendor_id: string;
  product_id: string;
  is_active: boolean;
  expiry_date: string | null;
  clicks: number;
  orders: number;
  total_commission: number;
  created_at: string;
  updated_at: string;
};
