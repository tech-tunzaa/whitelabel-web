import { Vendor } from "../types/vendor"

export const vendors: Vendor[] = [
    {
        id: 1,
        businessName: "Mama Ntilie Restaurant",
        email: "info@mamantilie.co.tz",
        phone: "+255 754 123 456",
        logo: "/placeholder.svg?height=40&width=40",
        category: "Food & Beverages",
        status: "pending",
        registrationDate: "2024-01-15",
        taxId: "TIN-12345678",
        address: {
            street: "Mikocheni B, Plot 123",
            city: "Dar es Salaam",
            state: "Dar es Salaam",
            zip: "14110",
            country: "Tanzania",
        },
        description:
            "Traditional Tanzanian restaurant serving authentic local cuisine including ugali, nyama choma, and pilau.",
        documents: {
            identity: [
                {
                    name: "ID_Front.jpg",
                    url: "/placeholder.svg?height=200&width=300",
                },
                {
                    name: "ID_Back.jpg",
                    url: "/placeholder.svg?height=200&width=300",
                },
            ],
            business: [
                {
                    name: "Business_License.pdf",
                    url: "/placeholder.svg?height=200&width=300",
                },
                {
                    name: "Food_Hygiene_Certificate.pdf",
                    url: "/placeholder.svg?height=200&width=300",
                },
            ],
            bank: [
                {
                    name: "Bank_Statement.pdf",
                    url: "/placeholder.svg?height=200&width=300",
                },
            ],
        },
    },
    {
        id: 2,
        businessName: "Kilimanjaro Crafts & Souvenirs",
        email: "sales@kilicrafts.co.tz",
        phone: "+255 784 234 567",
        logo: "/placeholder.svg?height=40&width=40",
        category: "Handmade Goods",
        status: "active",
        registrationDate: "2023-11-20",
        taxId: "TIN-23456789",
        address: {
            street: "Moshi Town, Market Street",
            city: "Moshi",
            state: "Kilimanjaro",
            zip: "25101",
            country: "Tanzania",
        },
        description:
            "Local artisan shop selling handmade Maasai jewelry, Tinga Tinga paintings, and traditional Tanzanian crafts.",
        documents: {
            identity: [
                {
                    name: "ID_Front.jpg",
                    url: "/placeholder.svg?height=200&width=300",
                },
                {
                    name: "ID_Back.jpg",
                    url: "/placeholder.svg?height=200&width=300",
                },
            ],
            business: [
                {
                    name: "Business_License.pdf",
                    url: "/placeholder.svg?height=200&width=300",
                },
                {
                    name: "Artisan_Cooperative_Certificate.pdf",
                    url: "/placeholder.svg?height=200&width=300",
                },
            ],
            bank: [
                {
                    name: "Bank_Statement.pdf",
                    url: "/placeholder.svg?height=200&width=300",
                },
            ],
        },
    },
    {
        id: 3,
        businessName: "Zanzibar Spice Co.",
        email: "orders@zanzibarspices.co.tz",
        phone: "+255 777 345 678",
        logo: "/placeholder.svg?height=40&width=40",
        category: "Food & Beverages",
        status: "active",
        registrationDate: "2023-10-05",
        taxId: "TIN-34567890",
        address: {
            street: "Stone Town, Forodhani",
            city: "Zanzibar City",
            state: "Zanzibar",
            zip: "71101",
            country: "Tanzania",
        },
        description:
            "Premium spice company offering authentic Zanzibari spices including cloves, cinnamon, and vanilla.",
        documents: {
            identity: [
                {
                    name: "ID_Front.jpg",
                    url: "/placeholder.svg?height=200&width=300",
                },
                {
                    name: "ID_Back.jpg",
                    url: "/placeholder.svg?height=200&width=300",
                },
            ],
            business: [
                {
                    name: "Business_License.pdf",
                    url: "/placeholder.svg?height=200&width=300",
                },
                {
                    name: "Export_License.pdf",
                    url: "/placeholder.svg?height=200&width=300",
                },
            ],
            bank: [
                {
                    name: "Bank_Statement.pdf",
                    url: "/placeholder.svg?height=200&width=300",
                },
            ],
        },
    },
] 