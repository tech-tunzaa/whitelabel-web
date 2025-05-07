"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, X } from "lucide-react";
import { use } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { OrderItems } from "@/features/orders/components/order-items";
import { OrderTimeline } from "@/features/orders/components/order-timeline";
import { CustomerInfo } from "@/features/orders/components/customer-info";
import { ShippingInfo } from "@/features/orders/components/shipping-info";
import { PaymentInfo } from "@/features/orders/components/payment-info";
import { useOrderStore } from "@/features/orders/stores/order-store";

interface RefundDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function RefundDetailsPage({ params }: RefundDetailsPageProps) {
  const router = useRouter();
  const { orders, updateOrder } = useOrderStore();
  const { id } = use(params);
  const order = orders.find((o) => o.id === parseInt(id));

  // Find the refund request event in the timeline
  const refundEvent = order?.timeline.find(
    (event) => event.status.toLowerCase().includes("refund") || event.status === "returned"
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "TZS",
    }).format(amount);
  };

  const handleApproveRefund = () => {
    if (!order) return;

    // Update the order's refund status to approved
    const updatedOrder = {
      ...order,
      refundStatus: "approved" as const,
      timeline: [
        ...order.timeline,
        {
          status: "refunded",
          timestamp: new Date().toISOString(),
          note: "Refund approved and processed to original payment method",
        },
      ],
    };
    updateOrder(updatedOrder);
    toast.success(`Refund for order #${order.id} has been approved`);
    router.push("/dashboard/orders/refunds");
  };

  const handleRejectRefund = () => {
    if (!order) return;

    // Update the order's refund status to rejected
    const updatedOrder = {
      ...order,
      refundStatus: "rejected" as const,
      timeline: [
        ...order.timeline,
        {
          status: "cancelled",
          timestamp: new Date().toISOString(),
          note: "Refund request has been rejected",
        },
      ],
    };
    updateOrder(updatedOrder);
    toast.success(`Refund for order #${order.id} has been rejected`);
    router.push("/dashboard/orders/refunds");
  };

  if (!order) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Refund Not Found</h1>
            <p className="text-muted-foreground">
              The refund you are looking for does not exist.
            </p>
          </div>
        </div>
        <div className="p-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/orders/refunds")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Refunds
          </Button>
        </div>
      </div>
    );
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending Review";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/orders/refunds")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight">
            Refund Request for Order #{order.id}
          </h1>
          <p className="text-sm text-muted-foreground">
            Requested on {refundEvent ? format(new Date(refundEvent.timestamp), "PPP p") : ""}  
          </p>
        </div>
        <Badge variant={getStatusVariant(order.refundStatus)} className="ml-auto">
          {getStatusLabel(order.refundStatus)}
        </Badge>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Refund reason */}
            <Card>
              <CardHeader>
                <CardTitle>Refund Reason</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-md bg-muted/10">
                  <p>{refundEvent?.note || "No reason provided"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Order items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderItems order={order} />
              </CardContent>
            </Card>

            {/* Order timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderTimeline timeline={order.timeline} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Customer info */}
            <CustomerInfo customer={order.customer} />

            {/* Shipping info */}
            <ShippingInfo order={order} />

            {/* Payment info */}
            <PaymentInfo payment={order.payment} />

            {/* Refund actions */}
            {order.refundStatus === "pending" && (
              <Card>
                <CardHeader>
                  <CardTitle>Refund Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={handleApproveRefund}
                    variant="default"
                  >
                    <Check className="mr-2 h-4 w-4" /> Approve Refund
                  </Button>
                  <Button 
                    className="w-full" 
                    onClick={handleRejectRefund}
                    variant="outline"
                  >
                    <X className="mr-2 h-4 w-4" /> Reject Refund
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* View original order */}
            <Card>
              <CardContent className="pt-6">
                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                >
                  View Original Order
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
