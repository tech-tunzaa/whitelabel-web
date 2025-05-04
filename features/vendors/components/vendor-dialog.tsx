"use client"

import { Vendor } from "../types/vendor"
import { VendorDetails } from "./vendor-details"
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

interface VendorDialogProps {
  vendor: Vendor | null
  isOpen: boolean
  onClose: () => void
  onApprove: (id: number, commissionPlan: string, kycVerified: boolean) => void
  onReject: (id: number) => void
}

export function VendorDialog({ vendor, isOpen, onClose, onApprove, onReject }: VendorDialogProps) {
  const isMobile = useIsMobile()

  if (!vendor) return null

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Vendor Application</DrawerTitle>
            <DrawerDescription>Review the vendor's information and documents</DrawerDescription>
          </DrawerHeader>
          <VendorDetails
            vendor={vendor}
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
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Vendor Application</DialogTitle>
          <DialogDescription>Review the vendor's information and documents</DialogDescription>
        </DialogHeader>
        <VendorDetails vendor={vendor} onApprove={onApprove} onReject={onReject} />
      </DialogContent>
    </Dialog>
  )
} 