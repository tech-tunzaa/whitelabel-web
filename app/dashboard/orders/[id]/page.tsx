"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { User as NextAuthUser } from "next-auth";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ErrorCard } from "@/components/ui/error-card";
import { Spinner } from "@/components/ui/spinner";
import { Copy } from "@/components/ui/copy";
import { toast } from "sonner";

import DeliveryManagement from "@/features/orders/components/order-delivery-management";
import { useOrderStore } from "@/features/orders/store";
import { useVendorStore } from "@/features/vendors/store";
import { VendorResponseItem } from "@/features/orders/components/vendor-response-item";
import {
  Order,
  OrderItem,
  VendorResponse,
  OrderError,
} from "@/features/orders/types";

import {
  ArrowLeft,
  Package,
  CreditCard,
  Truck,
  User,
  Calendar,
  RefreshCcw,
  ShoppingBag,
  FileText,
  ExternalLink,
  Mail,
  Phone,
} from "lucide-react";

const OrderPage = () => {
  const params = useParams();
  interface ExtendedUser extends User {
    tenant_id?: string;
  }

  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'payment'>('overview');
  const getTransactionStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "destructive";
      default:
        return "default";
    }
  };

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "destructive";
      default:
        return "default";
    }
  };

  const { data: session } = useSession();
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [loadedVendors, setLoadedVendors] = useState<Record<string, boolean>>(
    {}
  );

  const {
    order,
    loading: orderLoading,
    error: orderError,
    fetchOrder,
    activeAction,
  } = useOrderStore();

  const { vendor, loading: vendorLoading, fetchVendor } = useVendorStore();

  useEffect(() => {
    const user = session?.user as ExtendedUser;
    if (user?.tenant_id && params.id) {
      fetchOrder(params.id as string, { "X-Tenant-ID": user.tenant_id });
    }
  }, [session, params.id, fetchOrder]);

  const handleAccordionChange = async (index: number) => {
    if (!order?.items) return;
    const isExpanded = expandedItems.includes(index);
    if (isExpanded) {
      setExpandedItems(expandedItems.filter((i) => i !== index));
    } else {
      setExpandedItems([...expandedItems, index]);
      const item = order?.items[index];
      const user = session?.user as ExtendedUser;
      if (
        item?.vendor_id &&
        !loadedVendors[item.vendor_id] &&
        user?.tenant_id
      ) {
        setLoadedVendors((prev) => ({ ...prev, [item.vendor_id]: true }));
        await fetchVendor(item.vendor_id, { "X-Tenant-ID": user.tenant_id });
      }
    }
  };

  const router = useRouter();

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not specified";
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "TZS",
    }).format(price);
  };

  const fetchTransactionDetails = async (
    transactionId: string,
    headers: any
  ) => {
    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        headers: headers,
      });
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error("Failed to fetch transaction details");
      }
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    // Fetch transaction details when payment tab is opened
    if (activeTab === 'payment' && order?.payment_details?.transaction_id && session?.user?.tenant_id) {
      fetchTransactionDetails(order.payment_details.transaction_id, { 'X-Tenant-ID': session.user.tenant_id })
        .then((details) => {
          setTransactionDetails(details);
        })
        .catch((error) => {
          console.error('Error fetching transaction details:', error);
          toast.error('Failed to fetch transaction details');
        });
    }
  }, [activeTab, order?.payment_details?.transaction_id, session?.user?.tenant_id]);

  if (orderLoading && !order) {
    return <Spinner />;
  }

  if (orderError && !order) {
    const error = {
      status:
        typeof orderError.status === "number"
          ? orderError.status.toString()
          : "Error",
      message:
        orderError.message || "An error occurred while loading the order",
    };
    return (
      <ErrorCard
        title="Failed to load order"
        error={error}
        buttonText="Back to Orders"
        buttonAction={() => router.push("/dashboard/orders")}
        buttonIcon={ArrowLeft}
      />
    );
  }

  return order ? (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/orders")}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>

          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                <ShoppingBag className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center gap-4 mb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">
                    Order #{order?.order_number}
                  </h1>
                  <Copy text={order?.order_number} size={16} />
                </div>
                <Badge variant={getStatusBadgeVariant(order?.status || "")}>
                  {order?.status || "Unknown"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Order placed: {formatDate(order?.created_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 p-6 space-y-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="payment">Payment & Installments</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Order Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground italic">
                        "{order?.notes || "No notes added"}"
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Items
                  </CardTitle>
                  <CardDescription>
                    {order?.items?.length || 0} items in this order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order?.items.map((item, index) => (
                        <React.Fragment key={index}>
                          <TableRow
                            className="relative cursor-pointer hover:bg-muted/50"
                            onClick={() => handleAccordionChange(index)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-lg border bg-muted/30 flex items-center justify-center">
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="font-medium hover:text-primary">
                                    {item.name}
                                  </p>
                                  {item.product_id && (
                                    <Link
                                      href={`/dashboard/products/${item.product_id}`}
                                      target="_blank"
                                      className="flex items-center gap-1 max-w-xs group"
                                    >
                                      <p className="text-sm text-muted-foreground truncate group-hover:text-primary group-hover:underline">
                                        Product ID: {item.product_id}
                                      </p>
                                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono">
                              {item.sku || "N/A"}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">{item.quantity}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatPrice(item.unit_price)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatPrice(item.total)}
                            </TableCell>
                          </TableRow>
                          {expandedItems.includes(index) && (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="bg-muted/30 p-4"
                              >
                                <VendorResponseItem
                                  vendorId={item.vendor_id}
                                  response={
                                    order.vendor_responses?.[
                                      item.vendor_id
                                    ] || {
                                      status: "pending",
                                      responded_at: undefined,
                                    }
                                  }
                                  vendor={vendor || undefined}
                                  isLoading={vendorLoading}
                                />
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {order?.refunds && order.refunds.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <RefreshCcw className="h-5 w-5" />
                      Refunds
                    </CardTitle>
                    <CardDescription>
                      {order.refunds.length} refund
                      {order.refunds.length > 1 ? "s" : ""} processed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {order.refunds.map((refund, index) => (
                        <div
                          key={index}
                          className="rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="destructive" className="capitalize">
                              Refunded
                            </Badge>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {formatDate(refund.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                              Refund Amount
                            </p>
                            <p className="font-medium text-destructive">
                              {formatPrice(refund.amount)}
                            </p>
                          </div>
                          {refund.reason && (
                            <div className="mt-2 text-sm text-muted-foreground border-t pt-2">
                              <p className="font-medium mb-1">
                                Reason for Refund:
                              </p>
                              <p className="text-sm">{refund.reason}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="payment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Details
                  </CardTitle>
                  <CardDescription>
                    Payment information and transaction history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Total Amount</span>
                        <span className="text-2xl font-bold">
                          {formatPrice(order?.payment_details?.amount)}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-medium">Payment Status</span>
                        <Badge
                          variant={getPaymentStatusBadgeVariant(
                            order?.payment_status || ""
                          )}
                          className="text-base"
                        >
                          {order?.payment_status || "Unknown"}
                        </Badge>
                      </div>
                    </div>
                    
                    {order?.payment_details && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <span className="text-sm font-medium">Payment ID</span>
                            <div className="flex items-center gap-2">
                              <Copy 
                                text={order.payment_details.payment_id} 
                                className="text-sm" 
                              />
                              <span className="text-sm text-muted-foreground">
                                ({order.payment_details.payment_gateway})
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-sm font-medium">Amount</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {formatPrice(order.payment_details.amount)}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-sm font-medium">Status</span>
                            <Badge
                              variant={getTransactionStatusBadgeVariant(
                                order.payment_details.status || ""
                              )}
                              className="text-sm ms-2"
                            >
                              {order.payment_details.status || "Unknown"}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <span className="text-sm font-medium">Payment Method</span>
                            <span className="text-sm ms-2">
                              {order.payment_details.method}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-sm font-medium">Paid At</span>
                            <span className="text-sm ms-2">
                              {formatDate(order.payment_details.paid_at)}
                            </span>
                          </div>
                          {order.payment_details.notes && (
                            <div className="space-y-1">
                              <span className="text-sm font-medium">Notes</span>
                              <span className="text-sm text-muted-foreground ms-2">
                                {order.payment_details.notes}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {order?.plan?.installments &&
                order.plan.installments.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Installment Plan
                      </CardTitle>
                      <CardDescription>
                        {order.plan.installments.length} installments scheduled
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {order.plan.installments.map(
                          (installment: any, index: number) => (
                            <div
                              key={index}
                              className="rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <Badge
                                  variant={getStatusBadgeVariant(
                                    installment.status
                                  )}
                                  className="capitalize"
                                >
                                  {installment.status}
                                </Badge>
                                <div
                                  className={cn(
                                    "text-sm flex items-center gap-2",
                                    installment.status === "pending" &&
                                      new Date(installment.due_date) <
                                        new Date()
                                      ? "text-destructive animate-pulse font-medium"
                                      : "text-muted-foreground"
                                  )}
                                >
                                  <Calendar className="h-4 w-4" />
                                  <span className="flex-1">
                                    Due: {formatDate(installment.due_date)}
                                  </span>
                                  {installment.status === "pending" &&
                                    new Date(installment.due_date).getTime() <
                                      new Date().getTime() && (
                                    <div className="flex items-center gap-2">
                                      <AlertTriangle className="h-4 w-4 text-destructive" />
                                      <span className="text-xs font-medium">Overdue</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                  Installment {index + 1}
                                </p>
                                <p className="font-medium">
                                  {formatPrice(installment.amount)}
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
            </TabsContent>
          </Tabs>

          <div className="w-full space-y-6 lg:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      {formatPrice(order?.totals?.subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-medium text-destructive">
                      -{formatPrice(order.totals.discount) || "TZS 0.00"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">
                      {formatPrice(order.totals.tax) || "TZS 0.00"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {formatPrice(order?.totals?.shipping) || "TZS 0.00"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-4">
                    <span className="text-lg font-medium">Total</span>
                    <span className="text-lg font-bold">
                      {formatPrice(order?.totals?.total)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
                <CardDescription>
                  Contact details of the customer
                </CardDescription>
              </CardHeader>
              <CardContent>
                {order?.shipping_address && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Name</span>
                      </div>
                      <p className="text-sm font-medium">
                        {`${order.shipping_address.first_name} ${order.shipping_address.last_name}`}
                      </p>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Email</span>
                      </div>
                      <a
                        href={`mailto:${order.shipping_address.email}`}
                        className="text-sm font-medium hover:text-primary hover:underline flex items-center gap-1"
                      >
                        {order.shipping_address.email}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Phone</span>
                      </div>
                      <a
                        href={`tel:${order.shipping_address.phone}`}
                        className="text-sm font-medium hover:text-primary hover:underline flex items-center gap-1"
                      >
                        {order.shipping_address.phone}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
                <CardDescription>Delivery address and details</CardDescription>
              </CardHeader>
              <CardContent>
                {order?.shipping_address && (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-medium">Address</span>
                      <p className="text-sm text-right">
                        {order.shipping_address.address_line1}
                        {order.shipping_address.address_line2 && (
                          <span className="block text-muted-foreground">
                            {order.shipping_address.address_line2}
                          </span>
                        )}
                      </p>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">City</span>
                      <p className="text-sm">{order.shipping_address.city}</p>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        State/Province
                      </span>
                      <p className="text-sm">
                        {order.shipping_address.state_province}
                      </p>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Postal Code</span>
                      <Badge variant="outline" className="font-mono">
                        {order.shipping_address.postal_code}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <DeliveryManagement
              order={order}
              delivery_details={order?.delivery_details}
            />
          </div>
        </div>
      </main>
    </div>
  ) : null;
};

export default OrderPage;
