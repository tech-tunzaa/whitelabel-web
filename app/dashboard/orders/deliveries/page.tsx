"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import Pagination from "@/components/ui/pagination";
import { ErrorCard } from "@/components/ui/error-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useDeliveryStore } from "@/features/orders/deliveries/store";
import { Delivery, DeliveryListResponse } from "@/features/orders/deliveries/types";
import { DeliveryTable } from "@/features/orders/deliveries/components/delivery-table";
import { useSession } from "next-auth/react";
import { AlertCircle } from "lucide-react";

export default function DeliveryPage() {
  const router = useRouter();
  const session = useSession();
  const tenantId = session?.data?.user?.tenant_id;
  const { deliveries, loading, storeError, fetchDeliveries } = useDeliveryStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [isTabLoading, setIsTabLoading] = useState(false);
  const pageSize = 10;

  // Define tenant headers
  const tenantHeaders = {
    'X-Tenant-ID': tenantId
  };

  // Define filter based on active tab
  const getFilters = (): any => {
    const baseFilter: any = {
      skip: (currentPage - 1) * pageSize,
      limit: pageSize
    };

    // Add search filter if available
    if (searchQuery) {
      baseFilter.search = searchQuery;
    }

    // Add filter based on the active tab
    if (activeTab !== "all") {
      baseFilter.stage = activeTab;
    }

    return baseFilter;
  };

  // Fetch deliveries when tab changes or page changes
  useEffect(() => {
    const fetchDeliveriesData = async () => {
      try {
        setIsTabLoading(true);
        const filters = getFilters();
        await fetchDeliveries(filters, tenantHeaders);
      } catch (error) {
        console.error("Error fetching deliveries:", error);
      } finally {
        setIsTabLoading(false);
      }
    };

    fetchDeliveriesData();
  }, [fetchDeliveries, activeTab, currentPage, searchQuery]);

  const handleDeliveryClick = (delivery: Delivery) => {
    router.push(`/dashboard/orders/deliveries/${delivery.id}`);
  };

  if (loading && !deliveries) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Deliveries</h1>
            <p className="text-muted-foreground">Monitor order deliveries</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      </div>
    );
  }

  if (storeError && !loading) {
    return (
      <ErrorCard
        title="Failed to load deliveries"
        error={{ status: storeError.status?.toString() || "Error", message: storeError.message }}
        buttonText="Retry"
        buttonAction={() => fetchDeliveries()}
        buttonIcon={AlertCircle}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Deliveries</h1>
          <p className="text-muted-foreground">Monitor marketplace order deliveries</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchDeliveries(getFilters(), tenantHeaders)}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Input
          placeholder="Search deliveries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="assigned">Assigned</TabsTrigger>
            <TabsTrigger value="picked_up">Picked Up</TabsTrigger>
            <TabsTrigger value="in_transit">In Transit</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
          </TabsList>
        </Tabs>

        <DeliveryTable
          deliveries={deliveries?.items || []}
          onDeliveryClick={handleDeliveryClick}
          activeTab={activeTab}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil((deliveries?.total || 0) / pageSize)}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
