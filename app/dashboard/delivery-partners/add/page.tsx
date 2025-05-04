"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDeliveryPartnerStore } from "@/features/delivery-partners/stores/delivery-partner-store"
import { DeliveryPartnerForm } from "@/features/delivery-partners/components/delivery-partner-form"
import { DeliveryPartner } from "@/features/delivery-partners/types/delivery-partner"

export default function AddDeliveryPartnerPage() {
    const router = useRouter()
    const { addDeliveryPartner } = useDeliveryPartnerStore()

    const handleSubmit = (data: any) => {
        const newPartner: DeliveryPartner = {
            _id: Math.random().toString(36).substr(2, 9),
            userId: data.userId || "",
            type: data.type as 'individual' | 'business' | 'pickup_point',
            name: data.businessName,
            profilePicture: "",
            location: {
                coordinates: {
                    lat: parseFloat(data.latitude),
                    lng: parseFloat(data.longitude),
                },
                radiusKm: parseFloat(data.serviceRadius),
            },
            vehicleInfo: {
                type: data.vehicleType,
                details: data.vehicleDetails,
            },
            commissionPercent: parseFloat(data.commissionPercent),
            drivers: [data.riderName],
            kyc: {
                verified: false,
                documents: [],
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        addDeliveryPartner(newPartner)
        router.push("/dashboard/delivery-partners")
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center p-4 border-b">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push("/dashboard/delivery-partners")}
                    className="mr-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Add Delivery Partner</h1>
                    <p className="text-muted-foreground">
                        Create a new delivery partner account
                    </p>
                </div>
            </div>

            <div className="p-4">
                <DeliveryPartnerForm
                    onSubmit={handleSubmit}
                    onCancel={() => router.push("/dashboard/delivery-partners")}
                />
            </div>
        </div>
    )
} 