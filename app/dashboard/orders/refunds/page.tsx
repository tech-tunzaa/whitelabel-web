"use client";

import { useState } from "react";
import { useOrderStore } from "@/features/orders/stores/order-store";
import { useRouter } from "next/navigation";
import { RefundHeader } from "@/features/orders/refunds/components/refund-header";
import { RefundTable } from "@/features/orders/refunds/components/refund-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Order } from "@/features/orders/types/order";

export default function RefundPage() {
  const router = useRouter();
  const { orders } = useOrderStore();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter orders with refundStatus "pending" for the pending tab
  const pendingRefunds = orders.filter(
    (order) =>
      order.refundStatus === "pending" &&
      order.id.toString().includes(searchQuery)
  );

  // Filter orders with refundStatus "approved" for the approved tab
  const approvedRefunds = orders.filter(
    (order) =>
      order.refundStatus === "approved" &&
      order.id.toString().includes(searchQuery)
  );

  // Filter orders with refundStatus "rejected" for the rejected tab
  const rejectedRefunds = orders.filter(
    (order) =>
      order.refundStatus === "rejected" &&
      order.id.toString().includes(searchQuery)
  );

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Refund Management
          </h1>
          <p className="text-muted-foreground">
            Manage customer refund requests and approvals
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <RefundHeader onSearchChange={handleSearchChange} />

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="pending">
              Pending Refunds
              <Badge variant="secondary" className="ml-2">
                {pendingRefunds.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved Refunds
              <Badge variant="secondary" className="ml-2">
                {approvedRefunds.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected Refunds
              <Badge variant="secondary" className="ml-2">
                {rejectedRefunds.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <RefundTable orders={pendingRefunds} refundStatus="pending" />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="approved" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <RefundTable orders={approvedRefunds} refundStatus="approved" />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="rejected" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <RefundTable orders={rejectedRefunds} refundStatus="rejected" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
