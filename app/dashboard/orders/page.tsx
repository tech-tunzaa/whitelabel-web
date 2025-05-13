"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ErrorCard } from "@/components/ui/error-card";
import { RefreshCw } from "lucide-react";

import { OrderTable } from "@/features/orders/components/order-table";
import { OrderFilters } from "@/features/orders/components/order-filters";
import { useOrderStore } from "@/features/orders/store";
import type { Order, OrderStatus, OrderFilter } from "@/features/orders/types";

export default function OrdersPage() {
  const { orders, loading, storeError, fetchOrders } = useOrderStore();
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  
  // Define tenant headers
  const tenantHeaders = {
    'X-Tenant-ID': '4c56d0c3-55d9-495b-ae26-0d922d430a42'
  };

  // Function to load orders
  const loadOrders = async (filter: OrderFilter = {}) => {
    try {
      await fetchOrders(filter, tenantHeaders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Initial load
  useEffect(() => {
    loadOrders();
  }, []);

  // Apply filters to orders
  useEffect(() => {
    if (!orders) {
      setFilteredOrders([]);
      return;
    }

    let filtered = [...orders];

    // Apply status filter if not 'all'
    if (currentStatus !== 'all' && currentStatus !== 'flagged') {
      filtered = filtered.filter(order => order.status === currentStatus);
    } else if (currentStatus === 'flagged') {
      filtered = filtered.filter(order => order.flagged);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.order_number.toLowerCase().includes(query) ||
        order.customer.name.toLowerCase().includes(query) ||
        order.customer.email.toLowerCase().includes(query)
      );
    }

    // Apply date filter
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at);
        
        if (dateRange.from && dateRange.to) {
          return orderDate >= dateRange.from && orderDate <= dateRange.to;
        }
        if (dateRange.from) {
          return orderDate >= dateRange.from;
        }
        if (dateRange.to) {
          return orderDate <= dateRange.to;
        }
        return true;
      });
    }

    setFilteredOrders(filtered);
  }, [orders, currentStatus, searchQuery, dateRange]);

  // Handle filter changes
  const handleStatusChange = (status: string) => {
    setCurrentStatus(status);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setDateRange(range);
  };

  // Calculate counts for each category
  const pendingOrders = orders.filter(order => order.status === "pending");
  const processingOrders = orders.filter(order => order.status === "processing");
  const shippedOrders = orders.filter(order => order.status === "shipped");
  const deliveredOrders = orders.filter(order => order.status === "delivered");
  const cancelledOrders = orders.filter(order => order.status === "cancelled");
  const completedOrders = orders.filter(order => order.status === "completed");
  const refundedOrders = orders.filter(order => order.status === "refunded");
  const flaggedOrders = orders.filter(order => order.flagged);

  if (loading && orders.length === 0) {
    return (
      <Spinner />
    );
  }

  if (storeError && orders.length === 0) {
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
        <ErrorCard
          title="Failed to load orders"
          error={{ message: storeError.message, status: storeError.status }}
          buttonText="Retry"
          buttonAction={() => loadOrders()}
          buttonIcon={RefreshCw}
        />
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
        <OrderFilters 
          onStatusChange={handleStatusChange}
          onSearchChange={handleSearchChange}
          onDateRangeChange={handleDateRangeChange}
        />

        <Tabs defaultValue="all" className="" onValueChange={handleStatusChange}>
          <TabsList className="grid grid-cols-3 md:grid-cols-8 mb-4 w-full">
            <TabsTrigger value="all">
              All
              <Badge variant="secondary" className="ml-2">
                {orders.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              <Badge variant="secondary" className="ml-2">
                {pendingOrders.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="processing">
              Processing
              <Badge variant="secondary" className="ml-2">
                {processingOrders.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="shipped">
              Shipped
              <Badge variant="secondary" className="ml-2">
                {shippedOrders.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="delivered">
              Delivered
              <Badge variant="secondary" className="ml-2">
                {deliveredOrders.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed
              <Badge variant="secondary" className="ml-2">
                {completedOrders.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled
              <Badge variant="secondary" className="ml-2">
                {cancelledOrders.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="refunded">
              Refunded
              <Badge variant="secondary" className="ml-2">
                {refundedOrders.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <Card>
            <CardContent className="p-0">
              {loading && orders.length > 0 ? (
                <div className="flex justify-center items-center h-64">
                  <Spinner size="lg" />
                </div>
              ) : (
                <OrderTable orders={filteredOrders} />
              )}
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
}
