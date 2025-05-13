export interface Location {
    coordinates: {
        lat: number
        lng: number
    }
    radiusKm: number
}

export interface VehicleInfo {
    type: string
    details: string
}

export interface KycDocument {
    type: string
    number: string
    link: string
    verified?: boolean
}

export interface Kyc {
    verified: boolean
    documents: KycDocument[]
}

export interface DeliveryPartner {
    _id: string
    userId: string
    type: 'individual' | 'business' | 'pickup_point'
    name: string
    profilePicture: string
    location?: Location
    vehicleInfo?: VehicleInfo
    commissionPercent: number
    drivers?: string[]
    kyc: Kyc
    status: 'pending' | 'active' | 'rejected' | 'suspended'
    createdAt: string
    updatedAt: string
}

export interface DeliveryPartnerFilter {
    skip?: number
    limit?: number
    search?: string
    status?: string
    type?: string
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
