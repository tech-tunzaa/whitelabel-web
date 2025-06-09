export interface Location {
    coordinates: {
        lat: number
        lng: number
    }
}

export interface VehicleInfo {
    type: string
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
    _id: string
    user_id: string
    user: {
        first_name: string
        last_name: string
        email: string
        phone_number: string
    }
    type: 'individual' | 'business' | 'pickup_point'
    name: string
    profile_picture: string
    location?: Location
    vehicle_info?: VehicleInfo
    cost_per_km?: number
    flat_fee?: number
    description?: string
    tax_id?: string
    drivers?: string[]
    kyc: Kyc
    status: 'pending' | 'active' | 'rejected' | 'suspended'
    created_at: string
    updated_at: string
}

export interface DeliveryPartnerFilter {
    skip?: number
    limit?: number
    search?: string
    status?: string
    type?: string
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
