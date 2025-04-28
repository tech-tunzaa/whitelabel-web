"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Update the import paths for mockOrders and mockRiders
import { mockOrders } from "../data/orders";
import { mockRiders } from "../data/riders";

import { OrderStatusBadge } from "../../../../features/orders/components/order-status-badge";

export default function OrderDetailsPage({ params }) {
  const router = useRouter();
  const orderId = Number.parseInt(params.id);
  const [order, setOrder] = useState(mockOrders.find((o) => o.id === orderId));
  const [messageText, setMessageText] = useState("");
  const [selectedRider, setSelectedRider] = useState("");
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isAssignRiderDialogOpen, setIsAssignRiderDialogOpen] = useState(false);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The order you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => router.push("/admin/orders")}>
          Back to Orders
        </Button>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleStatusChange = (newStatus) => {
    setOrder({ ...order, status: newStatus });
    toast.success(`Order status updated to ${newStatus}`);
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    toast.success("Message sent successfully");
    setMessageText("");
    setIsContactDialogOpen(false);
  };

  const handleRefund = () => {
    setOrder({ ...order, status: "refunded" });
    toast.success("Refund processed successfully");
    setIsRefundDialogOpen(false);
  };

  const handleCancel = () => {
    setOrder({ ...order, status: "cancelled" });
    toast.success("Order cancelled successfully");
    setIsCancelDialogOpen(false);
  };

  const handleAssignRider = () => {
    if (!selectedRider) return;

    const rider = mockRiders.find(
      (r) => r.id === Number.parseInt(selectedRider)
    );
    setOrder({ ...order, rider: rider, status: "processing" });
    toast.success(`Order assigned to ${rider.name}`);
    setIsAssignRiderDialogOpen(false);
  };

  const handleToggleFlag = () => {
    setOrder({ ...order, flagged: !order.flagged });
    toast.success(
      order.flagged ? "Issue marked as resolved" : "Issue flagged for follow-up"
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/orders")}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">
              Order #{order.id}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            <span className="mr-3">{formatDate(order.orderDate)}</span>
            <Clock className="h-4 w-4 mr-1" />
            <span>
              {new Date(order.orderDate).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>Items included in this order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-start space-x-4">
                      <div className="h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={
                            item.image || "/placeholder.svg?height=64&width=64"
                          }
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × {formatCurrency(item.price)}
                        </p>
                        {item.options && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {Object.entries(item.options).map(
                              ([key, value]) => (
                                <span key={key} className="mr-2">
                                  {key}: {value}
                                </span>
                              )
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-end border-t pt-4">
                <div className="space-y-1 w-full max-w-[200px]">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{formatCurrency(order.shipping)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
                <CardDescription>
                  Track the progress of this order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative pl-6 border-l space-y-6">
                  {order.timeline.map((event, index) => (
                    <div key={index} className="relative pb-6 last:pb-0">
                      <div className="absolute -left-[25px] h-6 w-6 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">{event.status}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span className="mr-3">
                            {formatDate(event.timestamp)}
                          </span>
                          <Clock className="h-3 w-3 mr-1" />
                          <span>
                            {new Date(event.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {event.note && (
                          <p className="text-sm mt-1">{event.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar>
                    <AvatarImage
                      src={order.customer.avatar || "/placeholder.svg"}
                    />
                    <AvatarFallback>
                      {order.customer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{order.customer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Customer since {order.customer.since}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{order.customer.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{order.customer.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">
                      Orders: {order.customer.orderCount}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsContactDialogOpen(true)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Customer
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipping Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">{order.shipping.name}</p>
                    <p className="text-sm">{order.shipping.address.street}</p>
                    <p className="text-sm">
                      {order.shipping.address.city},{" "}
                      {order.shipping.address.state}{" "}
                      {order.shipping.address.zip}
                    </p>
                    <p className="text-sm">{order.shipping.address.country}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Shipping Method</p>
                    <p className="text-sm">{order.shipping.method}</p>
                  </div>
                  {order.rider && (
                    <div>
                      <p className="text-sm font-medium">Delivery Rider</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={order.rider.avatar || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {order.rider.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{order.rider.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                {!order.rider &&
                  order.status !== "cancelled" &&
                  order.status !== "refunded" && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsAssignRiderDialogOpen(true)}
                    >
                      Assign Rider
                    </Button>
                  )}
                {order.rider && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsContactDialogOpen(true)}
                  >
                    Contact Rider
                  </Button>
                )}
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Payment Method</p>
                    <p className="text-sm">{order.payment.method}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Payment Status</p>
                    <Badge
                      variant={
                        order.payment.status === "paid" ? "success" : "warning"
                      }
                    >
                      {order.payment.status.charAt(0).toUpperCase() +
                        order.payment.status.slice(1)}
                    </Badge>
                  </div>
                  {order.payment.transactionId && (
                    <div>
                      <p className="text-sm font-medium">Transaction ID</p>
                      <p className="text-sm font-mono">
                        {order.payment.transactionId}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Tabs defaultValue="status" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="status">Update Status</TabsTrigger>
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                  </TabsList>
                  <TabsContent value="status" className="space-y-4 pt-4">
                    <Select
                      value={order.status}
                      onValueChange={handleStatusChange}
                      disabled={
                        order.status === "cancelled" ||
                        order.status === "refunded"
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </TabsContent>
                  <TabsContent value="actions" className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 gap-2">
                      {order.status !== "cancelled" &&
                        order.status !== "refunded" && (
                          <>
                            <Button
                              variant="outline"
                              onClick={() => setIsCancelDialogOpen(true)}
                              className="justify-start"
                            >
                              Cancel Order
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setIsRefundDialogOpen(true)}
                              className="justify-start"
                            >
                              Issue Refund
                            </Button>
                          </>
                        )}
                      <Button
                        variant={order.flagged ? "default" : "outline"}
                        onClick={handleToggleFlag}
                        className="justify-start"
                      >
                        {order.flagged ? "Resolve Issue" : "Flag Issue"}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contact Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Contact {order.rider ? "Rider" : "Customer"}
            </DialogTitle>
            <DialogDescription>
              Send a message to{" "}
              {order.rider ? order.rider.name : order.customer.name} regarding
              this order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Type your message here..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsContactDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSendMessage}>Send Message</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Refund</DialogTitle>
            <DialogDescription>
              Are you sure you want to issue a refund for this order? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRefundDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRefund}>
              Issue Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
            >
              No, Keep Order
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              Yes, Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Rider Dialog */}
      <Dialog
        open={isAssignRiderDialogOpen}
        onOpenChange={setIsAssignRiderDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Rider</DialogTitle>
            <DialogDescription>
              Select a rider to deliver this order.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedRider} onValueChange={setSelectedRider}>
              <SelectTrigger>
                <SelectValue placeholder="Select a rider" />
              </SelectTrigger>
              <SelectContent>
                {mockRiders
                  .filter((rider) => rider.status === "available")
                  .map((rider) => (
                    <SelectItem key={rider.id} value={rider.id.toString()}>
                      {rider.name} - {rider.distance} miles away
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignRiderDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignRider} disabled={!selectedRider}>
              Assign Rider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
