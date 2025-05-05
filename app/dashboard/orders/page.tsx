"use client";

import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { OrderTable } from "@/features/orders/components/order-table";
import { OrderFilters } from "@/features/orders/components/order-filters";
import { useOrderStore } from "@/features/orders/stores/order-store";
import type { OrderStatus } from "@/features/orders/types/order";

export default function OrdersPage() {
  const { getFilteredOrders, setSelectedStatus } = useOrderStore();
  const filteredOrders = getFilteredOrders();

  const pendingOrders = filteredOrders.filter(
    (order) => order.status === "pending"
  );
  const processingOrders = filteredOrders.filter(
    (order) => order.status === "processing"
  );
  const shippedOrders = filteredOrders.filter(
    (order) => order.status === "shipped"
  );
  const deliveredOrders = filteredOrders.filter(
    (order) => order.status === "delivered"
  );
  const cancelledOrders = filteredOrders.filter(
    (order) => order.status === "cancelled"
  );
  const refundedOrders = filteredOrders.filter(
    (order) => order.status === "refunded"
  );
  const flaggedOrders = filteredOrders.filter((order) => order.flagged);

  useEffect(() => {
    // Reset status filter when component unmounts
    return () => {
      setSelectedStatus("all");
    };
  }, [setSelectedStatus]);

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
        <OrderFilters />

        <Tabs defaultValue="all" className="">
          <TabsList className="grid grid-cols-4 md:grid-cols-8 mb-4 w-full">
            <TabsTrigger value="all">
              All
              <Badge variant="secondary" className="ml-2">
                {filteredOrders.length}
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
            <TabsTrigger value="flagged">
              Flagged
              <Badge variant="secondary" className="ml-2">
                {flaggedOrders.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <OrderTable orders={filteredOrders} />
              </CardContent>
            </Card>
          </TabsContent>

          {[
            "pending",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
            "refunded",
            "flagged",
          ].map((status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              <Card>
                <CardContent className="p-0">
                  <OrderTable
                    orders={
                      status === "flagged"
                        ? flaggedOrders
                        : filteredOrders.filter(
                            (order) => order.status === status
                          )
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
