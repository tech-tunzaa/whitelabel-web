export interface Location {
    coordinates: {
        lat: number
        lng: number
    }
}

export interface VehicleInfo {
    vehicle_type_id: string
    plate_number: string
    details?: { key: string; value: string; }[]
}

export interface KycDocument {
    type: string
    number: string
    link: string
    expires_at?: string
    rejected_at?: string
    rejected_reason?: string
    verified?: boolean
}

export interface Kyc {
    verified: boolean
    documents: KycDocument[]
}

export interface DeliveryPartner {
    _id: string; // Will be mapped from partner_id
    partner_id?: string; // From API
    user_id?: string; // From API, but seems missing in the example
    tenant_id?: string; // From API
    user: {
        first_name: string;
        last_name: string;
        email: string;
        phone_number: string;
    } | null;
    type: 'individual' | 'business' | 'pickup_point';
    name: string;
    profile_picture?: string;
    location?: Location;
    vehicle_info?: VehicleInfo;
    kyc: Kyc;
    is_active?: boolean; // From API
    is_approved?: boolean; // From API
    status?: 'pending' | 'active' | 'rejected' | 'suspended'; // Keep for potential use, but make optional
    cost_per_km?: number;
    flat_fee?: number;
    description?: string;
    tax_id?: string;
    drivers?: string[];
    created_at?: string;
    updated_at?: string;
}

export interface DeliveryPartnerFilter {
    skip?: number
    limit?: number
    search?: string
    status?: string
    partner_type?: string
    verification_status?: string
    is_active?: boolean
}

export interface DeliveryPartnerListResponse {
    items: DeliveryPartner[]
    total: number
    skip: number
    limit: number
}

export type DeliveryPartnerAction = 
    | 'fetchList'
    | 'fetchOne'
    | 'fetchByUser'
    | 'create'
    | 'update'
    | 'delete'
    | 'uploadKyc';

export interface DeliveryPartnerError {
    message: string
    status?: number
}

export interface ApiResponse<T> {
  data: T;
  success?: boolean;
  message?: string;
}
