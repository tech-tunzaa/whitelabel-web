import { create } from 'zustand'
import { DeliveryPartner, DeliveryPartnerStatus } from '../types/delivery-partner'
import { deliveryPartners as mockDeliveryPartners } from '../data/delivery-partners'

interface DeliveryPartnerStore {
    deliveryPartners: (DeliveryPartner & { status: DeliveryPartnerStatus })[]
    addDeliveryPartner: (partner: DeliveryPartner) => void
    updateDeliveryPartner: (id: string, partner: Partial<DeliveryPartner>) => void
    deleteDeliveryPartner: (id: string) => void
    approveDeliveryPartner: (id: string, commissionPercent: number, kycVerified: boolean) => void
    rejectDeliveryPartner: (id: string) => void
}

export const useDeliveryPartnerStore = create<DeliveryPartnerStore>((set) => ({
    deliveryPartners: mockDeliveryPartners,
    addDeliveryPartner: (partner) =>
        set((state) => ({
            deliveryPartners: [...state.deliveryPartners, partner]
        })),
    updateDeliveryPartner: (id, partner) =>
        set((state) => ({
            deliveryPartners: state.deliveryPartners.map((p) =>
                p._id === id ? { ...p, ...partner } : p
            )
        })),
    deleteDeliveryPartner: (id) =>
        set((state) => ({
            deliveryPartners: state.deliveryPartners.filter((p) => p._id !== id)
        })),
    approveDeliveryPartner: (id, commissionPercent, kycVerified) =>
        set((state) => ({
            deliveryPartners: state.deliveryPartners.map((p) =>
                p._id === id
                    ? {
                        ...p,
                        commissionPercent,
                        kyc: { ...p.kyc, verified: kycVerified }
                    }
                    : p
            )
        })),
    rejectDeliveryPartner: (id) =>
        set((state) => ({
            deliveryPartners: state.deliveryPartners.map((p) =>
                p._id === id ? { ...p, status: 'rejected' } : p
            )
        }))
})) 