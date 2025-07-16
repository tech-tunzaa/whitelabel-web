"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import Pagination from "@/components/ui/pagination";
import { ErrorCard } from "@/components/ui/error-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAffiliateStore } from "@/features/affiliates/store";
import { Affiliate, AffiliateFilter } from "@/features/affiliates/types";
import { AffiliateTable } from "@/features/affiliates/components/affiliate-table";
import { AffiliateRejectionDialog } from "@/features/affiliates/components";

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
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [pendingAction, setPendingAction] = useState<null | 'approve' | 'reject' | 'activate' | 'deactivate'>(null);

  const getFilters = () => {
    const baseFilter: any = {
      skip: (currentPage - 1) * pageSize,
      limit: pageSize,
    };
    if (searchQuery) {
      baseFilter.search = searchQuery;
    }
    let filters = baseFilter;
    switch (activeTab) {
      case "pending":
        filters = { ...baseFilter, status: "pending" };
        break;
      case "approved":
        filters = { ...baseFilter, status: "approved", is_active: true };
        break;
      case "rejected":
        filters = { ...baseFilter, status: "rejected" };
        break;
      default:
        filters = baseFilter;
    }
    return filters;
  };

  useEffect(() => {
    if (tenantId) {
      fetchAffiliates(getFilters(), { 'X-Tenant-ID': tenantId });
    }
  }, [currentPage, pageSize, searchQuery, activeTab, tenantId, fetchAffiliates]);

  const handleAffiliateClick = (affiliate: Affiliate) => {
    router.push(`/dashboard/affiliates/${affiliate.id}`);
  };

  const handleStatusChange = async (
    affiliateId: string,
    action: 'approve' | 'reject' | 'activate' | 'deactivate',
    rejectionReason?: string
  ): Promise<void> => {
    if (!tenantId) {
      console.error("Tenant ID is missing, cannot update status.");
      toast.error("Tenant ID is missing, cannot update status.");
      return;
    }
    setRejectLoading(action === 'reject');
    try {
      let statusData: any = {};
      switch (action) {
        case 'approve':
          statusData = { status: 'approved' };
          break;
        case 'reject':
          statusData = { status: 'rejected', rejection_reason: rejectionReason };
          break;
        case 'activate':
          statusData = { is_active: true };
          break;
        case 'deactivate':
          statusData = { is_active: false, status: 'inactive' };
          break;
      }
      const result = await updateAffiliateStatus(affiliateId, statusData, { 'X-Tenant-ID': tenantId });
      if (result && !(result as any).error) {
        await fetchAffiliates(getFilters(), { 'X-Tenant-ID': tenantId });
        toast.success(`Affiliate status updated successfully`);
      } else {
        toast.error(`Failed to ${action} affiliate`);
      }
    } catch (error) {
      console.error("Failed to update affiliate status:", error);
      toast.error(`Failed to ${action} affiliate`);
    } finally {
      setRejectLoading(false);
      setShowRejectDialog(false);
      setSelectedAffiliate(null);
      setPendingAction(null);
    }
  };

  const handleReject = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setShowRejectDialog(true);
    setPendingAction('reject');
  };

  const handleRejectConfirm = (reason: string, customReason?: string) => {
    if (!selectedAffiliate) return;
    if (!reason && !customReason) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    handleStatusChange(selectedAffiliate.id, 'reject', reason === 'other' ? customReason : reason);
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
          <Spinner />
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
            buttonAction={() => {
              if (tenantId) {
                const baseFilter: any = {
                  skip: (currentPage - 1) * pageSize,
                  limit: pageSize,
                };
                if (searchQuery) {
                  baseFilter.search = searchQuery;
                }
                let filters = baseFilter;
                switch (activeTab) {
                  case "pending":
                    filters = { ...baseFilter, status: "pending" };
                    break;
                  case "approved":
                    filters = { ...baseFilter, status: "approved", is_active: true };
                    break;
                  case "rejected":
                    filters = { ...baseFilter, status: "rejected" };
                    break;
                  default:
                    filters = baseFilter;
                }
                fetchAffiliates(filters, { 'X-Tenant-ID': tenantId });
              }
            }}
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
            <Spinner />
          ) : storeError && affiliates.length === 0 ? (
             <ErrorCard
                title="Failed to load affiliates for this tab"
                error={{
                  status: storeError.status?.toString() || "Error",
                  message: storeError.message || "An unexpected error occurred."
                }}
                buttonText="Retry"
                buttonAction={() => {
                  if (tenantId) {
                    const baseFilter: any = {
                      skip: (currentPage - 1) * pageSize,
                      limit: pageSize,
                    };
                    if (searchQuery) {
                      baseFilter.search = searchQuery;
                    }
                    let filters = baseFilter;
                    switch (activeTab) {
                      case "pending":
                        filters = { ...baseFilter, status: "pending" };
                        break;
                      case "approved":
                        filters = { ...baseFilter, status: "approved" };
                        break;
                      case "rejected":
                        filters = { ...baseFilter, status: "rejected" };
                        break;
                      default:
                        filters = baseFilter;
                    }
                    fetchAffiliates(filters, { 'X-Tenant-ID': tenantId });
                  }
                }}
                buttonIcon={RefreshCw}
              />
          ) : (
            <div className="flex-grow flex flex-col">
              <AffiliateTable
                affiliates={affiliates} // Pass the affiliates from the store
                onAffiliateClick={handleAffiliateClick}
                onStatusChange={async (id, action, rejectionReason) => {
                  const affiliate = affiliates.find(a => a.id === id);
                  if (action === 'reject' && affiliate) {
                    handleReject(affiliate);
                  } else {
                    await handleStatusChange(id, action, rejectionReason);
                  }
                }}
                activeTab={activeTab} // Pass activeTab if table needs it for conditional rendering of actions
              />
              <Pagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={totalAffiliates}
                onPageChange={(page) => setCurrentPage(page)}
              />
              <AffiliateRejectionDialog
                isOpen={showRejectDialog}
                onClose={() => setShowRejectDialog(false)}
                onConfirm={handleRejectConfirm}
                loading={rejectLoading}
                title="Reject Affiliate"
                description="Please provide a reason for rejecting this affiliate. This information may be shared with the affiliate."
                actionText="Reject"
              />
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
}
