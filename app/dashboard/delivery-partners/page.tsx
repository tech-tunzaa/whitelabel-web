"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useDeliveryPartnerStore } from "@/features/delivery-partners/store"
import { DeliveryPartner, DeliveryPartnerFilter } from "@/features/delivery-partners/types"
import { DeliveryPartnerTable } from "@/features/delivery-partners/components/delivery-partner-table"
import { ErrorCard } from "@/components/ui/error-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, RefreshCw, Search } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { Pagination } from "@/components/ui/pagination"

const getStatusChangeMessage = (status: string) => {
    switch (status) {
        case "approved":
            return "Partner approved successfully"
        case "rejected":
            return "Partner rejected successfully"
        case "active":
            return "Partner activated successfully"
        case "suspended":
            return "Partner suspended successfully"
        default:
            return "Partner status updated successfully"
    }
}

export default function DeliveryPartnersPage() {
    const router = useRouter()
    const session = useSession()
    // Access tenant ID safely from session data
    const tenantId = session?.data?.user ? (session.data.user as any).tenant_id : undefined
    const { deliveryPartners, loading, storeError, fetchDeliveryPartners, updateDeliveryPartner } = useDeliveryPartnerStore()
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [activeTab, setActiveTab] = useState("all")
    const [isTabLoading, setIsTabLoading] = useState(false)
    const pageSize = 20

    // Define tenant headers
    const tenantHeaders = {
        'X-Tenant-ID': tenantId
    }

    // Define filter based on active tab
    const getFilters = (): DeliveryPartnerFilter => {
        const baseFilter: DeliveryPartnerFilter = {
            skip: (currentPage - 1) * pageSize,
            limit: pageSize
        }

        // Add search filter if available
        if (searchQuery) {
            baseFilter.search = searchQuery
        }

        // Add filter based on the active tab
        switch (activeTab) {
            case "active":
                return {
                    ...baseFilter,
                    status: "approved",
                    is_active: true
                }
            case "inactive":
                return {
                    ...baseFilter,
                    status: "approved",
                    is_active: false
                }
            case "individual":
                return {
                    ...baseFilter,
                    status: "approved",
                    type: "individual"
                }
            case "businesses":
                return {
                    ...baseFilter,
                    status: "approved",
                    type: "business"
                }
            case "pickup_points":
                return {
                    ...baseFilter,
                    status: "approved",
                    type: "pickup_point"
                }
            case "pending":
                return {
                    ...baseFilter,
                    status: "pending"
                }
            case "rejected":
                return {
                    ...baseFilter,
                    status: "rejected"
                }
            default:
                return baseFilter
        }
    }

    // Fetch delivery partners when tab changes or page changes
    useEffect(() => {
        const fetchPartnersData = async () => {
            try {
                setIsTabLoading(true)
                const filters = getFilters()
                await fetchDeliveryPartners(filters, tenantHeaders)
            } catch (error) {
                console.error("Error fetching delivery partners:", error)
            } finally {
                setIsTabLoading(false)
            }
        }

        fetchPartnersData()
    }, [fetchDeliveryPartners, activeTab, currentPage, searchQuery])

    const handlePartnerClick = (partner: DeliveryPartner) => {
        router.push(`/dashboard/delivery-partners/${partner.partner_id}`)
    }

    const handleStatusChange = async (partnerId: string, status: string, rejectionReason?: string) => {
        try {
            let updateData: any = {};
            
            // Handle different status changes
            if (status === "approved") {
                // Approve a pending partner
                updateData = { 
                    status: "approved",
                    verification_status: "approved", 
                    is_active: true 
                };
            } else if (status === "rejected") {
                // Reject a pending partner
                updateData = { 
                    status: "rejected",
                    verification_status: "rejected",
                    rejection_reason: rejectionReason || "Application rejected" 
                };
            } else if (status === "active") {
                // Activate a suspended partner
                updateData = { 
                    status: "active",
                    is_active: true 
                };
            } else if (status === "suspended") {
                // Suspend an active partner
                updateData = { 
                    status: "suspended",
                    is_active: false 
                };
            }
            
            const result = await updateDeliveryPartner(partnerId, updateData, tenantHeaders);
            
            if (result) {
                toast({
                    title: "Success",
                    description: getStatusChangeMessage(status),
                    variant: "success",
                });
                // Refresh the partners list
                fetchDeliveryPartners(getFilters(), tenantHeaders);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update partner status",
                variant: "destructive",
            });
        }
    };
    
    // Handle tab change
    const handleTabChange = (value: string) => {
        setActiveTab(value)
        setCurrentPage(1) // Reset to first page when changing tabs
    }
    
    // Filter partners based on search query
    const filteredPartners = deliveryPartners?.filter((partner) => {
        if (!searchQuery.trim()) return true
        
        const query = searchQuery.toLowerCase()
        
        return (
            partner.business_name?.toLowerCase().includes(query) ||
            partner.name?.toLowerCase().includes(query) ||
            partner.contact_email?.toLowerCase().includes(query) ||
            partner.contact_phone?.toLowerCase().includes(query)
        )
    }) || []

    if (loading && !deliveryPartners) {
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
                <Spinner />
            </div>
        )
    }

    if (!deliveryPartners && !loading && storeError) {
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

                <div>
                    <ErrorCard
                        title="Failed to load delivery partners"
                        error={{
                            status: storeError.status?.toString() || "Error",
                            message: storeError.message || "An error occurred"
                        }}
                        buttonText="Retry"
                        buttonAction={() => fetchDeliveryPartners(getFilters(), tenantHeaders)}
                        buttonIcon={RefreshCw}
                    />
                </div>
            </div>
        )
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
                    <Plus className="mr-2 h-4 w-4" />
                    Add Delivery Partner
                </Button>
            </div>

            <div className="p-4 space-y-4">
                <div className="flex justify-between mb-4">
                    <div className="relative w-[300px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search delivery partners..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value)
                                setCurrentPage(1) // Reset to first page when searching
                            }}
                        />
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <TabsList className="w-full mb-4">
                        <TabsTrigger value="all">All Partners</TabsTrigger>
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="inactive">Inactive</TabsTrigger>
                        <TabsTrigger value="individual">Individual</TabsTrigger>
                        <TabsTrigger value="businesses">Businesses</TabsTrigger>
                        <TabsTrigger value="pickup_points">Pickup Points</TabsTrigger>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="rejected">Rejected</TabsTrigger>
                    </TabsList>
                    
                    {isTabLoading ? (
                        <Spinner />
                    ) : (
                        <DeliveryPartnerTable
                            deliveryPartners={filteredPartners}
                            onPartnerClick={handlePartnerClick}
                            onStatusChange={handleStatusChange}
                            activeTab={activeTab}
                        />
                    )}
                </Tabs>

                {/* Pagination would go here */}
            </div>
        </div>
    )
} 