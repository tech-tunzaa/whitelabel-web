"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  RefreshCw,
  Package,
  Truck,
  FileCheck,
  ShieldAlert,
  Ban,
  CheckCircle2,
  Calendar,
  CreditCard,
  Clock,
  User,
  Copy,
  FileText,
  Phone,
  Mail,
  UserCheck,
  UserX,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ErrorCard } from "@/components/ui/error-card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useOrderStore } from "@/features/orders/store";
import {
  Order,
  OrderStatus,
  PaymentStatus,
  AssignDeliveryPayload,
} from "@/features/orders/types";
import { useDeliveryPartnerStore } from "@/features/delivery-partners/store";
import { DeliveryPartnerFilter } from "@/features/delivery-partners/types";

interface OrderPageProps {
  params: {
    id: string;
  };
}

// Helper functions
const getOrderStatusBadge = (
  status: string
): { variant: string; icon: any } => {
  const statusMap: Record<string, { variant: string; icon: any }> = {
    pending: { variant: "outline", icon: Package },
    processing: { variant: "secondary", icon: Package },
    confirmed: { variant: "default", icon: FileCheck },
    shipped: { variant: "primary", icon: Truck },
    delivered: { variant: "secondary", icon: CheckCircle2 },
    completed: { variant: "success", icon: CheckCircle2 },
    cancelled: { variant: "destructive", icon: Ban },
    refunded: { variant: "warning", icon: RefreshCw },
    partially_refunded: { variant: "warning", icon: RefreshCw },
  };
  return statusMap[status] || { variant: "secondary", icon: ShieldAlert };
};

const getPaymentStatusBadge = (
  status: string
): { variant: string; icon: any } => {
  const statusMap: Record<string, { variant: string; icon: any }> = {
    pending: { variant: "outline", icon: Clock },
    authorized: { variant: "primary", icon: FileCheck },
    paid: { variant: "success", icon: CheckCircle2 },
    failed: { variant: "destructive", icon: Ban },
    refunded: { variant: "warning", icon: RefreshCw },
    partially_refunded: { variant: "warning", icon: RefreshCw },
  };
  return statusMap[status] || { variant: "secondary", icon: ShieldAlert };
};

const formatCurrency = (amount: number, currency = "USD") => {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    amount
  );
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return format(date, "PPP");
  } catch (error) {
    return "Invalid date";
  }
};

const formatStatus = (status: string | undefined) => {
  if (!status) return "Unknown";
  return status
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getAvailableStatusTransitions = (
  currentStatus?: OrderStatus
): OrderStatus[] => {
  if (!currentStatus) return [];
  const transitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ["processing", "cancelled"],
    processing: ["confirmed", "cancelled"],
    confirmed: ["shipped", "cancelled"],
    shipped: ["delivered", "cancelled"],
    delivered: ["completed"],
    completed: [],
    cancelled: [],
    refunded: [],
    partially_refunded: [],
  };
  return transitions[currentStatus] || [];
};

const copyToClipboard = (text: string) => {
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success("Copied to clipboard"));
};

function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function OrderPage({ params }: OrderPageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const tenantId =
    session && session.user ? (session.user as any).tenant_id : undefined;
  const { id } = params;

  const order = useOrderStore((state) => state.order);
  const loading = useOrderStore((state) => state.loading);
  const storeError = useOrderStore((state) => state.storeError);
  const deliveryDetails = useOrderStore((state) => state.deliveryDetails);
  const fetchOrder = useOrderStore((state) => state.fetchOrder);
  const fetchOrderDeliveryDetails = useOrderStore((state) => state.fetchOrderDeliveryDetails);
  const updateOrderStatus = useOrderStore((state) => state.updateOrderStatus);
  const updatePaymentStatus = useOrderStore((state) => state.updatePaymentStatus);
  const assignDeliveryPartner = useOrderStore((state) => state.assignDeliveryPartner);
  const setStoreError = useOrderStore((state) => state.setStoreError);

  const assignedPartner = useDeliveryPartnerStore((state) => state.partner);
  const partnerLoading = useDeliveryPartnerStore((state) => state.loading);
  const fetchDeliveryPartner = useDeliveryPartnerStore((state) => state.fetchDeliveryPartner);
  const deliveryPartners = useDeliveryPartnerStore((state) => state.partners);
  const fetchDeliveryPartners = useDeliveryPartnerStore((state) => state.fetchDeliveryPartners);

  const [loadingPartners, setLoadingPartners] = useState(false);
  const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false);
  const [partnerType, setPartnerType] = useState<
    "business" | "pickup_point" | "individual"
  >("business");
  const [partnerSearchTerm, setPartnerSearchTerm] = useState("");
  const [assigningPartnerId, setAssigningPartnerId] = useState<string | null>(
    null
  );
  const debouncedPartnerSearchTerm = useDebounce(partnerSearchTerm, 500);

  const tenantHeaders = React.useMemo(
    () => (tenantId ? { "X-Tenant-ID": tenantId } : undefined),
    [tenantId]
  );

  const loadOrder = React.useCallback(async () => {
    if (id && tenantHeaders) {
      setStoreError(null);
      await fetchOrder(id, tenantHeaders);
    }
  }, [id, tenantHeaders, fetchOrder, setStoreError]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    if (order && tenantHeaders) {
      fetchOrderDeliveryDetails(order.order_id, tenantHeaders);
    }
  }, [order, tenantHeaders, fetchOrderDeliveryDetails]);

  const partnerId = useMemo(() => {
    if (!deliveryDetails) return null;
    // Prefer the top-level ID if it exists, as it's more direct.
    if (deliveryDetails.delivery_partner_id) {
      return deliveryDetails.delivery_partner_id;
    }
    // Fallback to checking the last stage of the delivery process.
    if (deliveryDetails.stages && deliveryDetails.stages.length > 0) {
      return deliveryDetails.stages[deliveryDetails.stages.length - 1].partner_id;
    }
    return null;
  }, [deliveryDetails]);

  useEffect(() => {
    console.log(`[page] useEffect for fetching partner triggered. Derived partnerId: ${partnerId}`);
    if (partnerId && tenantId) {
      console.log(`[page] Calling fetchDeliveryPartner with ID: ${partnerId}`);
      fetchDeliveryPartner(partnerId, { 'X-Tenant-Id': tenantId });
    }
    // This effect runs only when the derived partnerId changes, preventing loops.
  }, [partnerId, tenantId, fetchDeliveryPartner]);

  useEffect(() => {
    const loadDeliveryPartners = async () => {
      if (!isPartnerDialogOpen || !tenantHeaders) return;
      setLoadingPartners(true);
      const filter: DeliveryPartnerFilter = {
        partner_type: partnerType,
        search: debouncedPartnerSearchTerm,
        status: "active",
        is_active: true,
        limit: 50,
      };
      try {
        await fetchDeliveryPartners(filter, tenantHeaders);
      } catch (error) {
        toast.error("Failed to load delivery partners.");
      } finally {
        setLoadingPartners(false);
      }
    };
    loadDeliveryPartners();
  }, [
    isPartnerDialogOpen,
    partnerType,
    debouncedPartnerSearchTerm,
    tenantHeaders,
    fetchDeliveryPartners,
  ]);

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!order || !tenantHeaders) return;
    try {
      await updateOrderStatus(order.order_id, newStatus, tenantHeaders);
      toast.success(`Order status updated to ${formatStatus(newStatus)}`);
    } catch (error) {
      toast.error("Failed to update order status.");
    }
  };

  const handleUpdatePayment = async (newStatus: PaymentStatus) => {
    if (!order || !tenantHeaders) return;
    try {
      await updatePaymentStatus(order.order_id, newStatus, tenantHeaders);
      toast.success(`Payment status updated to ${formatStatus(newStatus)}`);
    } catch (error) {
      toast.error("Failed to update payment status.");
    }
  };

  const handleAssignPartner = async (partnerId: string) => {
    if (!order || !order.order_id || !tenantHeaders) {
      toast.error("Order details are not available.");
      return;
    }
    setAssigningPartnerId(partnerId);
    try {
      const payload: AssignDeliveryPayload = {
        order_id: order.order_id,
        pickup_points: [
          {
            partner_id: partnerId,
            timestamp: new Date().toISOString(),
          },
        ],
        stages: [
          {
            partner_id: partnerId,
            stage: "assigned",
            timestamp: new Date().toISOString(),
          },
        ],
        current_stage: "assigned",
      };
      await assignDeliveryPartner(payload, tenantHeaders);
      toast.success("Delivery partner assigned successfully!");
      setIsPartnerDialogOpen(false);
      loadOrder();
    } catch (error) {
      console.error("Error assigning delivery partner:", error);
      toast.error("Failed to assign delivery partner.");
    } finally {
      setAssigningPartnerId(null);
    }
  };

  if ((loading || !order) && !assigningPartnerId && !order) {
    return (
      <Spinner />
    );
  }

  if (storeError && !order) {
    return (
      <ErrorCard
        title="Error Loading Order"
        error={{
          message: storeError?.message || "Failed to load order",
          status: storeError?.status ? String(storeError.status) : "error",
        }}
        buttonText="Back to Orders"
        buttonAction={() => router.push("/dashboard/orders")}
        buttonIcon={ArrowLeft}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/orders")}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Order #{order.order_number}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => copyToClipboard(order.order_number)}
                title="Copy order number"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Badge variant={getOrderStatusBadge(order.status).variant as any}>
                {formatStatus(order.status)}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-1 mt-1">
              <Calendar className="h-3 w-3" /> Placed on{" "}
              {formatDate(order.created_at)}
            </p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.item_id}>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          {formatCurrency(item.unit_price, order.currency)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.total, order.currency)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p>
                    <strong>Name:</strong> {order.shipping_address.first_name}{" "}
                    {order.shipping_address.last_name}
                  </p>
                  <p>
                    <strong>Email:</strong> {order.shipping_address.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {order.shipping_address.phone}
                  </p>
                </div>
                <div>
                  <strong>Shipping Address:</strong>
                  <address className="not-italic">
                    {order.shipping_address.address_line1}
                    <br />
                    {order.shipping_address.address_line2 && (
                      <>
                        {order.shipping_address.address_line2}
                        <br />
                      </>
                    )}
                    {order.shipping_address.city},{" "}
                    {order.shipping_address.state_province}{" "}
                    {order.shipping_address.postal_code}
                    <br />
                    {order.shipping_address.country}
                  </address>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Update Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {getAvailableStatusTransitions(order.status).map(
                      (status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(status)}
                        >
                          {formatStatus(status)}
                        </Button>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Update Payment Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["pending", "paid", "failed", "refunded"].map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={
                          order.payment_status === status
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          handleUpdatePayment(status as PaymentStatus)
                        }
                        disabled={order.payment_status === status}
                      >
                        {formatStatus(status)}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>
                    {formatCurrency(order.totals.subtotal, order.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {formatCurrency(order.totals.shipping, order.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>
                    {formatCurrency(order.totals.tax, order.currency)}
                  </span>
                </div>
                {order.totals.discount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span>
                      -{formatCurrency(order.totals.discount, order.currency)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>
                    {formatCurrency(order.totals.total, order.currency)}
                  </span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Payment Status</span>
                    <Badge
                      variant={
                        getPaymentStatusBadge(order.payment_status)
                          .variant as any
                      }
                    >
                      {formatStatus(order.payment_status)}
                    </Badge>
                  </div>
                  {order.payment_details && (
                    <p className="text-sm text-muted-foreground">
                      Method: {formatStatus(order.payment_details.method)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Partner</CardTitle>
              </CardHeader>
              <CardContent>
                {partnerLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Spinner />
                  </div>
                ) : assignedPartner ? (
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage
                        src={assignedPartner.profile_picture || undefined}
                        alt={assignedPartner.name}
                      />
                      <AvatarFallback>
                        {assignedPartner.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold">{assignedPartner.name}</p>
                        <Badge variant="outline">{formatStatus(assignedPartner.type)}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1 mt-1">
                        {assignedPartner.type === 'individual' && assignedPartner.vehicle_info && (
                          <div className="flex items-center">
                            <Truck className="h-4 w-4 mr-2" />
                            <span>{assignedPartner.vehicle_info.vehicle_type_id || 'N/A'}</span>
                          </div>
                        )}
                          <a
                          href={`tel:${assignedPartner.user?.phone_number || ''}`}
                            className="flex items-center hover:text-primary"
                          >
                            <Phone className="h-4 w-4 mr-2" />
                          {assignedPartner.user?.phone_number || 'N/A'}
                          </a>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPartnerDialogOpen(true)}
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Reassign
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">
                      No delivery partner assigned.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPartnerDialogOpen(true)}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Assign Partner
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      <Dialog open={isPartnerDialogOpen} onOpenChange={setIsPartnerDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Assign Delivery Partner</DialogTitle>
            <DialogDescription>
              Select a partner to assign to this order. You can filter by type
              and search by name.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4">
            <Tabs
              value={partnerType}
              onValueChange={(value) => setPartnerType(value as any)}
            >
              <TabsList className="w-full">
                <TabsTrigger value="business">Business</TabsTrigger>
                <TabsTrigger value="pickup_point">Pickup Point</TabsTrigger>
                <TabsTrigger value="individual">Individual</TabsTrigger>
              </TabsList>
            </Tabs>
            <Input
              placeholder="Search by partner name..."
              value={partnerSearchTerm}
              onChange={(e) => setPartnerSearchTerm(e.target.value)}
            />
            <div className="relative min-h-[300px] max-h-[50vh] overflow-y-auto rounded-md border p-4">
              {loadingPartners ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Spinner />
                </div>
              ) : !deliveryPartners || deliveryPartners.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    No available partners found.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deliveryPartners.map((partner) => (
                    <div
                      key={partner.partner_id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold">
                            {partner.name}
                          </p>
                          <div className="text-sm text-muted-foreground flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <Mail className="w-3 h-3" />
                              <span>{partner?.user?.email || 'N/A'}</span>
                            </span>
                            {partner?.user?.phone_number && (
                              <span className="flex items-center space-x-1">
                                <Phone className="w-3 h-3" />
                                <span>{partner?.user?.phone_number || 'N/A'}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            partner.kyc.verified
                              ? "success"
                              : "secondary"
                          }
                        >
                          {partner.kyc.verified
                            ? "Verified"
                            : "Not Verified"
                          }
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => handleAssignPartner(partner.partner_id)}
                          disabled={assigningPartnerId}
                        >
                          {assigningPartnerId === partner.partner_id ? (
                            <Spinner size="sm" color="white" />
                          ) : (
                            "Assign"
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
