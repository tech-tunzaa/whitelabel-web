"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { use } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { OrderDetails } from "@/features/orders/components/order-details";
import { OrderTimeline } from "@/features/orders/components/order-timeline";
import { OrderItems } from "@/features/orders/components/order-items";
import { CustomerInfo } from "@/features/orders/components/customer-info";
import { ShippingInfo } from "@/features/orders/components/shipping-info";
import { PaymentInfo } from "@/features/orders/components/payment-info";
import { OrderActions } from "@/features/orders/components/order-actions";
import { useOrderStore } from "@/features/orders/stores/order-store";

interface OrderPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function OrderPage({ params }: OrderPageProps) {
  const router = useRouter();
  const { orders, setSelectedOrder, updateOrder } = useOrderStore();
  const { id } = use(params);
  const order = orders.find((o) => o.id === parseInt(id));

  useEffect(() => {
    if (order) {
      setSelectedOrder(order);
    }
    return () => {
      setSelectedOrder(null);
    };
  }, [order, setSelectedOrder]);

  if (!order) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Order Not Found</h1>
            <p className="text-muted-foreground">
              The order you are looking for does not exist.
            </p>
          </div>
        </div>
        <div className="p-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/orders")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/orders")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight">
            Order #{order.id}
          </h1>
          <p className="text-sm text-muted-foreground">
            {new Date(order.orderDate).toLocaleDateString()} {" "}
            {new Date(order.orderDate).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderItems order={order} />
              </CardContent>
            </Card>

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
            <CustomerInfo customer={order.customer} />
            <ShippingInfo order={order} />
            <PaymentInfo payment={order.payment} />
            <OrderActions order={order} onOrderUpdate={updateOrder} />
          </div>
        </div>
      </div>
    </div>
  );
}
