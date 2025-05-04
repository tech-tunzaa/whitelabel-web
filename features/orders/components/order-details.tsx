import { format } from "date-fns";
import { Calendar, Clock, CreditCard, Package, Truck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "./order-status-badge";
import { OrderTimeline } from "./order-timeline";
import { OrderItems } from "./order-items";
import type { Order } from "../types/order";

interface OrderDetailsProps {
  order: Order;
}

export function OrderDetails({ order }: OrderDetailsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "Tzs",
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Order Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Order ID</span>
            <span className="font-medium">#{order.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Date</span>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {format(new Date(order.orderDate), "MMM d, yyyy h:mm a")}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <OrderStatusBadge status={order.status} />
          </div>
          {order.flagged && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Flag</span>
              <Badge variant="destructive">Issue</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Method</span>
            <span className="font-medium">{order.payment.method}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge
              variant={
                order.payment.status === "paid"
                  ? "success"
                  : order.payment.status === "pending"
                  ? "warning"
                  : "destructive"
              }
            >
              {order.payment.status}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Transaction ID</span>
            <span className="font-medium">{order.payment.transactionId}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Shipping Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Method</span>
            <span className="font-medium">{order.shipping.method}</span>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Address</span>
            <p className="text-sm">
              {order.shipping.name}
              <br />
              {order.shipping.address.street}
              <br />
              {order.shipping.address.city}, {order.shipping.address.state}{" "}
              {order.shipping.address.zip}
              <br />
              {order.shipping.address.country}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Order Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OrderItems items={order.items} />
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Order Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderTimeline timeline={order.timeline} />
        </CardContent>
      </Card>
    </div>
  );
} 