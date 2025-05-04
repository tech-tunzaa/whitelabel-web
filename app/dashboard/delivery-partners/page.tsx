"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useDeliveryPartnerStore } from "@/features/delivery-partners/stores/delivery-partner-store"
import { DeliveryPartnerTable } from "@/features/delivery-partners/components/delivery-partner-table"
import { DeliveryPartnerDialog } from "@/features/delivery-partners/components/delivery-partner-dialog"
import { DeliveryPartner } from "@/features/delivery-partners/types/delivery-partner"

export default function DeliveryPartnersPage() {
    const router = useRouter()
    const { deliveryPartners, approveDeliveryPartner, rejectDeliveryPartner } = useDeliveryPartnerStore()
    const [selectedPartner, setSelectedPartner] = useState<DeliveryPartner | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handlePartnerClick = (partner: DeliveryPartner) => {
        setSelectedPartner(partner)
        setIsDialogOpen(true)
    }

    const handleApprovePartner = (partnerId: string, commissionPercent: number, kycVerified: boolean) => {
        approveDeliveryPartner(partnerId, commissionPercent, kycVerified)
        setIsDialogOpen(false)
    }

    const handleRejectPartner = (partnerId: string) => {
        rejectDeliveryPartner(partnerId)
        setIsDialogOpen(false)
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Delivery Partners</h1>
                    <p className="text-muted-foreground">
                        Manage delivery partner applications and accounts
                    </p>
                </div>
                <Button onClick={() => router.push("/dashboard/delivery-partners/add")}>
                    Add Delivery Partner
                </Button>
            </div>

            <div className="p-4 space-y-4">
                <DeliveryPartnerTable
                    deliveryPartners={deliveryPartners}
                    onDeliveryPartnerClick={handlePartnerClick}
                    onApproveDeliveryPartner={handleApprovePartner}
                    onRejectDeliveryPartner={handleRejectPartner}
                />
            </div>

            <DeliveryPartnerDialog
                partner={selectedPartner}
                isOpen={isDialogOpen}
                onClose={() => {
                    setIsDialogOpen(false)
                    setSelectedPartner(null)
                }}
                onApprove={handleApprovePartner}
                onReject={handleRejectPartner}
            />
        </div>
    )
} 