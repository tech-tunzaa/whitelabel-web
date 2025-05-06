import { DeliveryPartner, DeliveryPartnerStatus } from "../types/delivery-partner"

export const deliveryPartners: (DeliveryPartner & { status: DeliveryPartnerStatus })[] = [
    {
        _id: "dp1",
        userId: "u1",
        type: "individual",
        name: "John Makame",
        profilePicture: "/placeholder.svg?height=40&width=40",
        location: {
            coordinates: {
                lat: -6.776012,
                lng: 39.178326
            },
            radiusKm: 5
        },
        vehicleInfo: {
            type: "boda",
            details: "Honda XR 150, Red, 2022 Model"
        },
        commissionPercent: 10,
        kyc: {
            verified: true,
            documents: [
                {
                    type: "ID",
                    number: "TZA-ID-1234567",
                    link: "/placeholder.svg?height=200&width=300"
                },
                {
                    type: "driver_license",
                    number: "DL-87654321",
                    link: "/placeholder.svg?height=200&width=300"
                },
                {
                    type: "vehicle_registration",
                    number: "VR-54321",
                    link: "/placeholder.svg?height=200&width=300"
                }
            ]
        },
        createdAt: "2024-02-15T08:00:00.000Z",
        updatedAt: "2024-02-15T10:30:00.000Z",
        status: "active"
    },
    {
        _id: "dp2",
        userId: "u2",
        type: "business",
        name: "Swift Delivery Services",
        profilePicture: "/placeholder.svg?height=40&width=40",
        location: {
            coordinates: {
                lat: -6.801322,
                lng: 39.279726
            },
            radiusKm: 10
        },
        vehicleInfo: {
            type: "car",
            details: "Fleet of 3 Toyota Probox vehicles"
        },
        commissionPercent: 15,
        drivers: ["driver1", "driver2", "driver3"],
        kyc: {
            verified: true,
            documents: [
                {
                    type: "business_registration",
                    number: "BR-98765432",
                    link: "/placeholder.svg?height=200&width=300"
                },
                {
                    type: "tax_certificate",
                    number: "TC-12398765",
                    link: "/placeholder.svg?height=200&width=300"
                },
                {
                    type: "insurance_certificate",
                    number: "IC-87654321",
                    link: "/placeholder.svg?height=200&width=300"
                }
            ]
        },
        createdAt: "2024-01-10T09:15:00.000Z",
        updatedAt: "2024-01-25T14:45:00.000Z",
        status: "active"
    },
    {
        _id: "dp3",
        userId: "u3",
        type: "pickup_point",
        name: "Central Parcels Collection Point",
        profilePicture: "/placeholder.svg?height=40&width=40",
        location: {
            coordinates: {
                lat: -6.812756,
                lng: 39.291234
            },
            radiusKm: 1
        },
        commissionPercent: 5,
        kyc: {
            verified: false,
            documents: [
                {
                    type: "location_certificate",
                    number: "LC-5432198",
                    link: "/placeholder.svg?height=200&width=300"
                },
                {
                    type: "business_permit",
                    number: "BP-43219876",
                    link: "/placeholder.svg?height=200&width=300"
                }
            ]
        },
        createdAt: "2024-03-05T11:30:00.000Z",
        updatedAt: "2024-03-05T11:30:00.000Z",
        status: "pending"
    },
    {
        _id: "dp4",
        userId: "u4",
        type: "individual",
        name: "Sarah Mohammed",
        profilePicture: "/placeholder.svg?height=40&width=40",
        location: {
            coordinates: {
                lat: -6.773942,
                lng: 39.258364
            },
            radiusKm: 3
        },
        vehicleInfo: {
            type: "bicycle",
            details: "Mountain bike, suitable for short deliveries in urban areas"
        },
        commissionPercent: 8,
        kyc: {
            verified: true,
            documents: [
                {
                    type: "ID",
                    number: "TZA-ID-7654321",
                    link: "/placeholder.svg?height=200&width=300"
                }
            ]
        },
        createdAt: "2024-02-20T13:45:00.000Z",
        updatedAt: "2024-02-22T09:15:00.000Z",
        status: "active"
    },
    {
        _id: "dp5",
        userId: "u5",
        type: "business",
        name: "Rapid Logistics Tanzania",
        profilePicture: "/placeholder.svg?height=40&width=40",
        location: {
            coordinates: {
                lat: -6.782546,
                lng: 39.269453
            },
            radiusKm: 15
        },
        vehicleInfo: {
            type: "truck",
            details: "Fleet of 2 delivery trucks for large packages"
        },
        commissionPercent: 20,
        drivers: ["driver4", "driver5"],
        kyc: {
            verified: false,
            documents: [
                {
                    type: "business_registration",
                    number: "BR-54329876",
                    link: "/placeholder.svg?height=200&width=300"
                },
                {
                    type: "tax_certificate",
                    number: "TC-98761234",
                    link: "/placeholder.svg?height=200&width=300"
                }
            ]
        },
        createdAt: "2024-03-01T10:00:00.000Z",
        updatedAt: "2024-03-01T10:00:00.000Z",
        status: "pending"
    }
]
