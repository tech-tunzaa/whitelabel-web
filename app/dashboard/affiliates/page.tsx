"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import Pagination from "@/components/ui/pagination";
import { ErrorCard } from "@/components/ui/error-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAffiliateStore } from "@/features/affiliates/store";
import { Affiliate, AffiliateFilter } from "@/features/affiliates/types";
import { AffiliateTable } from "@/features/affiliates/components/affiliate-table";

export default function AffiliatesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const tenantId = session?.user?.tenant_id;

  const {
    affiliates,
    totalAffiliates,
    loading,
    error: storeError,
    fetchAffiliates,
    updateAffiliateStatus,
  } = useAffiliateStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [isTabLoading, setIsTabLoading] = useState(false);
  const pageSize = 10;

  const tenantHeaders = tenantId ? { 'X-Tenant-ID': tenantId } : {};

  const getFilters = (): AffiliateFilter => {
    const baseFilter: AffiliateFilter = {
      skip: (currentPage - 1) * pageSize,
      limit: pageSize,
    };

    if (searchQuery) {
      baseFilter.search = searchQuery;
    }

    switch (activeTab) {
      case "pending":
        return { ...baseFilter, status: "pending" };
      case "approved": // Assuming 'approved' means verified and active by default
        return { ...baseFilter, status: "approved", is_active: true };
      case "rejected":
        return { ...baseFilter, status: "rejected" };
      // Add cases for 'active' and 'inactive' if those tabs are added
      // case "active":
      //   return { ...baseFilter, status: "approved", is_active: true };
      // case "inactive":
      //   return { ...baseFilter, status: "approved", is_active: false };
      default: // "all"
        return baseFilter;
    }
  };

  useEffect(() => {
    const loadAffiliates = async () => {
      if (!tenantId) {
        // console.warn("Tenant ID not available yet, skipping fetch.");
        return; // Or handle appropriately, maybe show a message
      }
      setIsTabLoading(true);
      try {
        const filters = getFilters();
        await fetchAffiliates(filters, tenantHeaders);
      } catch (err) {
        console.error("Error fetching affiliates:", err);
        // Error is already set in the store by fetchAffiliates
      } finally {
        setIsTabLoading(false);
      }
    };

    loadAffiliates();
  }, [fetchAffiliates, activeTab, currentPage, searchQuery, tenantId]); // Added tenantId dependency

  const handleAffiliateClick = (affiliate: Affiliate) => {
    router.push(`/dashboard/affiliates/${affiliate.user_id}`);
  };

  const handleStatusChange = async (
    affiliateId: string,
    action: 'approve' | 'reject' | 'activate' | 'deactivate',
    rejectionReason?: string
  ) => {
    if (!tenantId) {
      console.error("Tenant ID is missing, cannot update status.");
      // Optionally, show a toast notification to the user
      return;
    }
    try {
      let statusData: Parameters<typeof updateAffiliateStatus>[1] = {};
      switch (action) {
        case 'approve':
          statusData = { verification_status: 'approved', is_active: true }; // Approve and activate
          break;
        case 'reject':
          statusData = { verification_status: 'rejected', rejection_reason };
          break;
        case 'activate':
          statusData = { is_active: true };
          break;
        case 'deactivate':
          statusData = { is_active: false };
          break;
      }
      await updateAffiliateStatus(affiliateId, statusData, tenantHeaders);
      // Data will be re-fetched by the useEffect due to store update, or explicitly call fetchAffiliates:
      // const filters = getFilters();
      // await fetchAffiliates(filters, tenantHeaders);
    } catch (error) {
      console.error("Failed to update affiliate status:", error);
      // Error is typically handled and set in the store method
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1); 
  };

  // Local search filtering, similar to VendorsPage
  // The API might also support search, in which case this local filter might be redundant
  // or a fallback. For now, let's assume API search is primary via getFilters().
  // If local search is preferred AFTER API fetch, implement similar to VendorsPage:
  // const locallyFilteredAffiliates = affiliates.filter((affiliate) => {
  //   if (!searchQuery.trim()) return true;
  //   const query = searchQuery.toLowerCase();
  //   return (
  //     affiliate.name?.toLowerCase().includes(query) ||
  //     affiliate.email?.toLowerCase().includes(query) ||
  //     affiliate.phone?.toLowerCase().includes(query)
  //   );
  // }) || [];

  if (loading && affiliates.length === 0 && !isTabLoading) { // Initial page load
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Affiliates (Mawinga)</h1>
            <p className="text-muted-foreground">Manage marketplace affiliates</p>
          </div>
          <Button onClick={() => router.push("/dashboard/affiliates/add")}>
            <Plus className="mr-2 h-4 w-4" /> Add Affiliate
          </Button>
        </div>
        <div className="flex items-center justify-center flex-grow">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (storeError && !loading && affiliates.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Affiliates (Mawinga)</h1>
            <p className="text-muted-foreground">Manage marketplace affiliates</p>
          </div>
          <Button onClick={() => router.push("/dashboard/affiliates/add")}>
            <Plus className="mr-2 h-4 w-4" /> Add Affiliate
          </Button>
        </div>
        <div className="flex-grow">
          <ErrorCard
            title="Failed to load affiliates"
            error={{
              status: storeError.status?.toString() || "Error",
              message: storeError.message || "An unexpected error occurred."
            }}
            buttonText="Retry"
            buttonAction={() => fetchAffiliates(getFilters(), tenantHeaders)}
            buttonIcon={RefreshCw}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Affiliates (Mawinga)</h1>
          <p className="text-muted-foreground">Manage marketplace affiliates</p>
        </div>
        <Button onClick={() => router.push("/dashboard/affiliates/add")}>
          <Plus className="mr-2 h-4 w-4" /> Add Affiliate
        </Button>
      </div>

      <div className="p-4 space-y-4 flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search affiliates..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); 
              }}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all">All Affiliates</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger> 
            {/* Consider adding Active/Inactive if needed, mirroring Vendors */}
            {/* <TabsTrigger value="active">Active</TabsTrigger> */}
            {/* <TabsTrigger value="inactive">Inactive</TabsTrigger> */}
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          {isTabLoading || (loading && affiliates.length === 0) ? (
            <div className="flex items-center justify-center flex-grow py-10">
              <Spinner size="lg" />
            </div>
          ) : storeError && affiliates.length === 0 ? (
             <ErrorCard
                title="Failed to load affiliates for this tab"
                error={{
                  status: storeError.status?.toString() || "Error",
                  message: storeError.message || "An unexpected error occurred."
                }}
                buttonText="Retry"
                buttonAction={() => fetchAffiliates(getFilters(), tenantHeaders)}
                buttonIcon={RefreshCw}
              />
          ) : (
            <div className="flex-grow flex flex-col">
              <AffiliateTable
                affiliates={affiliates} // Pass the affiliates from the store
                onAffiliateClick={handleAffiliateClick}
                onStatusChange={handleStatusChange}
                activeTab={activeTab} // Pass activeTab if table needs it for conditional rendering of actions
              />
              {totalAffiliates > 0 && (
                <Pagination
                  currentPage={currentPage}
                  pageSize={pageSize}
                  totalItems={totalAffiliates}
                  onPageChange={(page) => setCurrentPage(page)}
                  className="mt-auto pt-4"
                />
              )}
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
}
