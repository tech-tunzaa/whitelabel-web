"use client";

import { useState } from "react";
import { useOrderStore } from "@/features/orders/stores/order-store";
import { RefundHeader } from "@/features/orders/refunds/components/refund-header";
import { RefundTabs } from "@/features/orders/refunds/components/refund-tabs";
import { RefundDetailsDialog } from "@/features/orders/refunds/components/refund-details-dialog";
import { Order } from "@/features/orders/types/order";

export default function RefundPage() {
  const { orders, updateOrder } = useOrderStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Filter orders with status "Issued Refund" or "Return Requested" for the requests tab
  const refundRequests = orders.filter(
    (order) =>
      (order.status === "Issued Refund" || order.status === "Return Requested") &&
      order.id.toString().includes(searchQuery)
  );

  // Filter orders with status "Refunded" for the approved tab
  const approvedRefunds = orders.filter(
    (order) =>
      order.status === "Refunded" &&
      order.id.toString().includes(searchQuery)
  );

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsDialogOpen(true);
  };

  const handleApproveRefund = (orderId: number) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    updateOrder({
      ...order,
      status: "Refunded",
      timeline: [
        ...order.timeline,
        {
          status: "Refunded",
          timestamp: new Date().toISOString(),
          note: "Refund approved and processed to original payment method",
        },
      ],
    });
  };

  const handleRejectRefund = (orderId: number) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    updateOrder({
      ...order,
      status: "Rejected Refund",
      timeline: [
        ...order.timeline,
        {
          status: "Rejected Refund",
          timestamp: new Date().toISOString(),
          note: "Refund request has been rejected",
        },
      ],
    });
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
        <RefundHeader />
        <RefundTabs
          refundRequests={refundRequests}
          approvedRefunds={approvedRefunds}
          onViewDetails={handleViewDetails}
        />
      </div>

      {selectedOrder && (
        <RefundDetailsDialog
          isOpen={isDetailsDialogOpen}
          onClose={() => {
            setIsDetailsDialogOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onApprove={handleApproveRefund}
          onReject={handleRejectRefund}
        />
      )}
    </div>
  );
}
