export interface VendorAddress {
    street: string
    city: string
    state: string
    zip: string
    country: string
}

export interface VendorDocument {
    name: string
    url: string
}

export interface VendorDocuments {
    identity: VendorDocument[]
    business: VendorDocument[]
    bank: VendorDocument[]
}

export interface Vendor {
    id: number
    businessName: string
    email: string
    phone: string
    logo: string
    category: string
    status: VendorStatus
    registrationDate: string
    taxId: string
    address: VendorAddress
    description: string
    documents: VendorDocuments
    commissionPlan?: string
    kycVerified?: boolean
}

export type VendorStatus = "pending" | "active" | "rejected" 