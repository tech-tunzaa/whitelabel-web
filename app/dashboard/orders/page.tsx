"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ErrorCard } from "@/components/ui/error-card";
import { RefreshCw, Search, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { OrderTable } from "@/features/orders/components/order-table";
import { useOrderStore } from "@/features/orders/store";
import type { Order, OrderStatus, OrderFilter } from "@/features/orders/types";
import { cn } from "@/lib/utils";

export default function OrdersPage() {
  const router = useRouter();
  const session = useSession();
  const tenantId = session?.data?.user ? (session.data.user as any).tenant_id : undefined;
  
  const {
    orders,
    loading,
    storeError,
    fetchOrders,
    updateOrderStatus,
    setOrders,
    setStoreError
  } = useOrderStore();
  
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const pageSize = 10;

  // Define tenant headers
  const tenantHeaders = {
    "X-Tenant-ID": tenantId
  };

  // Define filter based on active tab
  const getFilter = () => {
    if (activeTab === "all") return {};
    return { status: activeTab };
  };

  // Function to load orders
  const loadOrders = async () => {
    try {
      setIsTabLoading(true);
      setStoreError(null);
      const filter = getFilter();
      await fetchOrders({
        ...filter,
        search: searchQuery,
        start_date: dateRange.from?.toISOString(),
        end_date: dateRange.to?.toISOString(),
      }, tenantHeaders);
    } catch (error) {
      console.error("Error loading orders:", error);
      // Always set empty orders array for 404 errors (no orders found)
      if (error instanceof Error && 
          ((error.message.includes("404") && error.message.includes("No orders found")) ||
           error.message.includes("not found"))) {
        setOrders([]);
        setStoreError(null);
      } else {
        // For other errors, set the error
        setStoreError(error instanceof Error ? error : new Error("Failed to load orders"));
      }
    } finally {
      setIsTabLoading(false);
    }
  };

  // Handle order click
  const handleOrderClick = (order: Order) => {
    router.push(`/dashboard/orders/${order.order_id}`);
  };

  // Handle status change
  // Update order status
  const handleOrderStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      // Clear any previous error state first
      setStoreError(null);
      
      // Show success toast only after successful update
      const result = await updateOrderStatus(orderId, status, tenantHeaders);
      if (result) {
        toast.success(`Order status updated to ${status.replace(/_/g, ' ')}`);
      }
      
      // No need to reload orders since updateOrderStatus already updates the state
    } catch (error) {
      toast.error("Failed to update order status");
      console.error("Failed to update order status:", error);
    }
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1); // Reset to first page when changing tabs
  };
  
  // Initial load effect
  useEffect(() => {
    if (tenantId) {
      loadOrders();
    }
  }, [tenantId]);
  
  // Effect for filter changes
  useEffect(() => {
    if (tenantId) {
      loadOrders();
    }
  }, [activeTab, currentPage, searchQuery, dateRange]);
  
  // Determine which orders to show based on active tab
  const displayOrders = activeTab === "all" ? orders : orders.filter(order => order.status === activeTab);

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground">
              Manage and track customer orders
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      </div>
    );
  }

  // Only show error card for real errors, not just empty results
  if (storeError && orders.length === 0 && !isTabLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground">
              Manage and track customer orders
            </p>
          </div>
        </div>
        <div className="p-4">
          <ErrorCard
            title="Error Loading Orders"
            error={{
              message: storeError?.message || "Failed to load orders",
              status: storeError?.status ? String(storeError.status) : "error"
            }}
            buttonText="Try Again"
            buttonAction={() => loadOrders()}
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
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track customer orders
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search and Date Filter */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
            />
          </div>

          <div className="flex space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateRange.from && !dateRange.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    "Filter by date"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            {(dateRange.from || dateRange.to) && (
              <Button
                variant="ghost"
                onClick={() => setDateRange({})}
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
        >
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="all">
              All
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending
            </TabsTrigger>
            <TabsTrigger value="processing">
              Processing
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              Confirmed
            </TabsTrigger>
            <TabsTrigger value="shipped">
              Shipped
            </TabsTrigger>
            <TabsTrigger value="delivered">
              Delivered
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled
            </TabsTrigger>
            <TabsTrigger value="refunded">
              Refunded
            </TabsTrigger>
            <TabsTrigger value="partially_refunded">
              Partial Refund
            </TabsTrigger>
          </TabsList>

          <Card>
            <CardContent className="p-0">
              {isTabLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Spinner />
                </div>
              ) : (
                <OrderTable
                  orders={displayOrders}
                  onViewDetails={handleOrderClick}
                  onStatusChange={handleOrderStatusChange}
                />
              )}
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
}
