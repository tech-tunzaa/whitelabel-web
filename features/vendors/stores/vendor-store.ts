import { create } from "zustand"
import { Vendor } from "../types/vendor"
import { vendors } from "../data/vendors"

interface VendorStore {
    vendors: Vendor[]
    addVendor: (vendor: Vendor) => void
    updateVendor: (vendor: Vendor) => void
    deleteVendor: (id: number) => void
    approveVendor: (id: number, commissionPlan: string, kycVerified: boolean) => void
    rejectVendor: (id: number) => void
}

export const useVendorStore = create<VendorStore>((set) => ({
    vendors,
    addVendor: (vendor) =>
        set((state) => ({
            vendors: [...state.vendors, vendor],
        })),
    updateVendor: (vendor) =>
        set((state) => ({
            vendors: state.vendors.map((v) => (v.id === vendor.id ? vendor : v)),
        })),
    deleteVendor: (id) =>
        set((state) => ({
            vendors: state.vendors.filter((v) => v.id !== id),
        })),
    approveVendor: (id, commissionPlan, kycVerified) =>
        set((state) => ({
            vendors: state.vendors.map((v) =>
                v.id === id
                    ? { ...v, status: "active", commissionPlan, kycVerified }
                    : v
            ),
        })),
    rejectVendor: (id) =>
        set((state) => ({
            vendors: state.vendors.map((v) =>
                v.id === id ? { ...v, status: "rejected" } : v
            ),
        })),
})) 