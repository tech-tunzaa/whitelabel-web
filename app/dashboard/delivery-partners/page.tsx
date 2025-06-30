"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useDeliveryPartnerStore } from "@/features/delivery-partners/store";
import {
  DeliveryPartner,
  DeliveryPartnerFilter,
  DeliveryPartnerListResponse,
} from "@/features/delivery-partners/types";
import { DeliveryPartnerTable } from "@/features/delivery-partners/components/delivery-partner-table";
import { ErrorCard } from "@/components/ui/error-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, RefreshCw, Search } from "lucide-react";
import Pagination from "@/components/ui/pagination";
import { toast } from "sonner";

const getStatusChangeMessage = (status: string) => {
  switch (status) {
    case "approved":
      return "Partner approved successfully";
    case "rejected":
      return "Partner rejected successfully";
    case "active":
      return "Partner activated successfully";
    case "suspended":
      return "Partner suspended successfully";
    default:
      return "Partner status updated successfully";
  }
};

export default function DeliveryPartnersPage() {
  const router = useRouter();
  const session = useSession();
  // Access tenant ID safely from session data
  const tenantId = session?.data?.user
    ? (session.data.user as any).tenant_id
    : undefined;
  const {
    deliveryPartners,
    loading,
    storeError,
    fetchDeliveryPartners,
    updateDeliveryPartner,
  } = useDeliveryPartnerStore();
  const pageSize = 10;
  // Initialize deliveryPartners with a default structure for items and total
  const [currentPartnersData, setCurrentPartnersData] =
    useState<DeliveryPartnerListResponse>({
      items: [],
      total: 0,
      skip: 0,
      limit: pageSize,
    });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [isTabLoading, setIsTabLoading] = useState(false);

  // Define tenant headers
  const tenantHeaders = {
    "X-Tenant-ID": tenantId,
  };

  // Define filter based on active tab
  const getFilters = (): DeliveryPartnerFilter => {
    const baseFilter: DeliveryPartnerFilter = {
      skip: (currentPage - 1) * pageSize,
      limit: pageSize,
    };

    // Add search filter if available
    if (searchQuery) {
      baseFilter.search = searchQuery;
    }

    // Add filter based on the active tab
    switch (activeTab) {
      case "active":
        return {
          ...baseFilter,
          // kyc_verified: true,
          is_active: true,
        };
      case "inactive":
        return {
          ...baseFilter,
          // kyc_verified: true,
          is_active: false,
        };
      case "individual":
        return {
          ...baseFilter,
          // kyc_verified: true,
          partner_type: "individual",
        };
      case "businesses":
        return {
          ...baseFilter,
          // kyc_verified: true,
          partner_type: "business",
        };
      case "pickup_points":
        return {
          ...baseFilter,
          // kyc_verified: true,
          partner_type: "pickup_point",
        };
      case "un_verified":
        return {
          ...baseFilter,
          kyc_verified: false,
        };
      default:
        return baseFilter;
    }
  };

  // Fetch delivery partners when tab changes or page changes
  useEffect(() => {
    const fetchPartnersData = async () => {
      try {
        setIsTabLoading(true);
        const filters = getFilters();
        const data = await fetchDeliveryPartners(filters, tenantHeaders);
        if (data && data.items !== undefined && data.total !== undefined) {
          setCurrentPartnersData(data);
        } else {
          // Handle cases where data might not be in the expected format, or is null/undefined
          setCurrentPartnersData({
            items: [],
            total: 0,
            skip: 0,
            limit: pageSize,
          });
        }
      } catch (error) {
        console.error("Error fetching delivery partners:", error);
      } finally {
        setIsTabLoading(false);
      }
    };

    fetchPartnersData();
  }, [fetchDeliveryPartners, activeTab, currentPage, searchQuery, tenantId]);

  const handlePartnerClick = (partner: DeliveryPartner) => {
    router.push(`/dashboard/delivery-partners/${partner.partner_id}`);
  };

  const handleStatusChange = async (
    partnerId: string,
    status: string,
    rejectionReason?: string
  ) => {
    try {
      console.log('Updating partner status:', { partnerId, status });
      
      // Update the partner status
      await updateDeliveryPartner(
        partnerId,
        { is_active: status === 'active' },
        tenantHeaders
      );
      
      // Force refresh the data from the store
      const updatedData = await fetchDeliveryPartners(getFilters(), tenantHeaders);
      setCurrentPartnersData(updatedData);
      
      toast.success(getStatusChangeMessage(status));
    } catch (error) {
      toast.error("Failed to update partner status");
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  // Filter partners based on search query
  const filteredPartners =
    currentPartnersData?.items?.filter((partner: DeliveryPartner) => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();

      return (
        partner.name?.toLowerCase().includes(query) ||
        partner.user?.first_name?.toLowerCase().includes(query) ||
        partner.user?.last_name?.toLowerCase().includes(query) ||
        partner.user?.email?.toLowerCase().includes(query) ||
        partner.user?.phone_number?.toLowerCase().includes(query)
      );
    }) || [];

  if (loading && currentPartnersData.items.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Delivery Partners
            </h1>
            <p className="text-muted-foreground">
              Manage delivery partner applications and accounts
            </p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/delivery-partners/add")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Delivery Partner
          </Button>
        </div>
        <Spinner />
      </div>
    );
  }

  if (!currentPartnersData.items.length && !loading && storeError) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Delivery Partners
            </h1>
            <p className="text-muted-foreground">
              Manage delivery partner applications and accounts
            </p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/delivery-partners/add")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Delivery Partner
          </Button>
        </div>

        <ErrorCard
          title="Failed to load delivery partners"
          error={{
            status: storeError.status?.toString() || "Error",
            message: storeError.message || "An error occurred",
          }}
          buttonText="Retry"
          buttonAction={() =>
            fetchDeliveryPartners(getFilters(), tenantHeaders)
          }
          buttonIcon={RefreshCw}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Delivery Partners
          </h1>
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
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
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
            <TabsTrigger value="un_verified">Unverified</TabsTrigger>
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
          {currentPartnersData &&
            currentPartnersData.items &&
            currentPartnersData.items.length > 0 && (
              <Pagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={currentPartnersData.total}
                onPageChange={(page: number) => setCurrentPage(page)}
              />
            )}
        </Tabs>
      </div>
    </div>
  );
}
