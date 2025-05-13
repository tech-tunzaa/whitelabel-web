"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useDeliveryPartnerStore } from "@/features/delivery-partners/store"
import { DeliveryPartnerTable } from "@/features/delivery-partners/components/delivery-partner-table"
import { DeliveryPartner } from "@/features/delivery-partners/types"
import { ErrorCard } from "@/components/ui/error-card"
import { ArrowLeft, Plus, RefreshCw } from "lucide-react"

export default function DeliveryPartnersPage() {
    const router = useRouter()
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [partners, setPartners] = useState<DeliveryPartner[]>([])
    const { fetchDeliveryPartners, updateDeliveryPartner } = useDeliveryPartnerStore()

    // Define tenant headers
    const tenantHeaders = {
        'X-Tenant-ID': '4c56d0c3-55d9-495b-ae26-0d922d430a42'
    };

    useEffect(() => {
        const loadPartners = async () => {
            try {
                setLoading(true)
                setError(null)
                // Pass tenant headers to the fetchDeliveryPartners function
                const response = await fetchDeliveryPartners(undefined, tenantHeaders)
                setPartners(response.items)
            } catch (err) {
                console.error('Error fetching delivery partners:', err)
                setError('Failed to load delivery partners. Please try again.')
            } finally {
                setLoading(false)
            }
        }

        loadPartners()
    }, [fetchDeliveryPartners])

    const handleApprovePartner = async (partnerId: string, commissionPercent: number, kycVerified: boolean) => {
        try {
            await updateDeliveryPartner(partnerId, {
                status: 'active',
                commissionPercent,
                kyc: {
                    verified: kycVerified,
                    documents: [] // This will be merged with existing documents
                }
            })
            
            // Refresh the partners list
            const response = await fetchDeliveryPartners()
            setPartners(response.items)
            
            router.push(`/dashboard/delivery-partners/${partnerId}`)
        } catch (err) {
            console.error('Error approving delivery partner:', err)
            setError('Failed to approve delivery partner. Please try again.')
        }
    }

    const handleRejectPartner = async (partnerId: string) => {
        try {
            await updateDeliveryPartner(partnerId, {
                status: 'rejected'
            })
            
            // Refresh the partners list
            const response = await fetchDeliveryPartners()
            setPartners(response.items)
            
            router.push(`/dashboard/delivery-partners/${partnerId}`)
        } catch (err) {
            console.error('Error rejecting delivery partner:', err)
            setError('Failed to reject delivery partner. Please try again.')
        }
    }

    if (loading) {
        return (
            <Spinner />
        )
    }

    if (!loading && error || !partners) {
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
                    <Plus className="mr-2 h-4 w-4" />
                    Add Delivery Partner
                    </Button>
                </div>
    
                <ErrorCard
                    title="Failed to load delivery partners"
                    error={error}
                    buttonText="Retry"
                    buttonAction={() => loadPartners()}
                    buttonIcon={RefreshCw}
                />
            </div>
        );
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
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Spinner size="lg" />
                    </div>
                ) : error ? (
                    <ErrorCard
                    title="Error Loading Delivery Partners"
                    error={{
                        message: error,
                        status: "error"
                    }}
                    buttonText="Back to Delivery Partners"
                    buttonAction={() => router.push("/dashboard/delivery-partners")}
                    buttonIcon={ArrowLeft}
                    />
                ) : (
                    <DeliveryPartnerTable
                        deliveryPartners={partners}
                        onApproveDeliveryPartner={handleApprovePartner}
                        onRejectDeliveryPartner={handleRejectPartner}
                    />
                )}
            </div>
        </div>
    )
} 