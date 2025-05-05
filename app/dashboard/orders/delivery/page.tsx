"use client";

import { useState } from "react";
import { useOrderStore } from "@/features/orders/stores/order-store";
import { mockRiders } from "@/features/orders/data/riders";
import { DeliveryHeader } from "@/features/orders/delivery/components/delivery-header";
import { DeliveryTabs } from "@/features/orders/delivery/components/delivery-tabs";
import { AssignRiderDialog } from "@/features/orders/delivery/components/assign-rider-dialog";
import { Order, Rider } from "@/features/orders/types/order";

export default function DeliveryPage() {
  const { orders, updateOrder } = useOrderStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const unassignedOrders = orders.filter(
    (order) =>
      !order.rider &&
      (order.status === "pending" || order.status === "processing") &&
      order.id.toString().includes(searchQuery)
  );

  const inProgressOrders = orders.filter(
    (order) =>
      order.rider &&
      (order.status === "processing" || order.status === "shipped") &&
      order.id.toString().includes(searchQuery)
  );

  const availableRiders = mockRiders.filter(
    (rider) => rider.status === "available"
  );

  const handleAssignRider = (order: Order) => {
    setSelectedOrder(order);
    setIsAssignDialogOpen(true);
  };

  const handleReassignRider = (order: Order) => {
    setSelectedOrder(order);
    setIsAssignDialogOpen(true);
  };

  const handleAssign = (orderId: number, riderId: number) => {
    const rider = availableRiders.find((r) => r.id === riderId);
    if (!rider) return;

    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    updateOrder({
      ...order,
      rider,
      status: "processing",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Delivery Management
          </h1>
          <p className="text-muted-foreground">
            Manage order deliveries and rider assignments
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <DeliveryHeader />
        <DeliveryTabs
          unassignedOrders={unassignedOrders}
          inProgressOrders={inProgressOrders}
          onAssignRider={handleAssignRider}
          onReassignRider={handleReassignRider}
        />
      </div>

      {selectedOrder && (
        <AssignRiderDialog
          isOpen={isAssignDialogOpen}
          onClose={() => {
            setIsAssignDialogOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          riders={availableRiders}
          onAssign={handleAssign}
        />
      )}
    </div>
  );
}
