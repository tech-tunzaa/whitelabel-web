"use client"

import { DeliveryPartner } from "../types/delivery-partner"
import { DeliveryPartnerDetails } from "./delivery-partner-details"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"

interface DeliveryPartnerDialogProps {
    partner: DeliveryPartner | null
    isOpen: boolean
    onClose: () => void
    onApprove: (id: string, commissionPercent: number, kycVerified: boolean) => void
    onReject: (id: string) => void
}

export function DeliveryPartnerDialog({
    partner,
    isOpen,
    onClose,
    onApprove,
    onReject,
}: DeliveryPartnerDialogProps) {
    const isMobile = useIsMobile()

    if (!partner) return null

    if (isMobile) {
        return (
            <Drawer open={isOpen} onOpenChange={onClose}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Delivery Partner Application</DrawerTitle>
                        <DrawerDescription>Review the delivery partner's information and documents</DrawerDescription>
                    </DrawerHeader>
                    <DeliveryPartnerDetails
                        partner={partner}
                        onApprove={onApprove}
                        onReject={onReject}
                        isMobile={true}
                    />
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Delivery Partner Application</DialogTitle>
                    <DialogDescription>Review the delivery partner's information and documents</DialogDescription>
                </DialogHeader>
                <DeliveryPartnerDetails partner={partner} onApprove={onApprove} onReject={onReject} />
            </DialogContent>
        </Dialog>
    )
}
