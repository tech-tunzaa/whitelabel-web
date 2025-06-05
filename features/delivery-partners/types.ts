export interface Location {
    coordinates: {
        lat: number
        lng: number
    }
}

export interface VehicleInfo {
    type: string
    plateNumber: string
    details: [
        {
            key: string
            value: string
        }
    ]
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
    user: {
        first_name: string
        last_name: string
        email: string
        phone_number: string
    }
    type: 'individual' | 'business' | 'pickup_point'
    name: string
    profilePicture: string
    location?: Location
    vehicleInfo?: VehicleInfo
    costPerKm?: number
    flatFee?: number
    description?: string
    taxId?: string
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
