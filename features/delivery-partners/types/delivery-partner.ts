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
    createdAt: string
    updatedAt: string
}

export type DeliveryPartnerStatus = 'pending' | 'active' | 'rejected' 