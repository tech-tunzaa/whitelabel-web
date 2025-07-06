"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { User as NextAuthUser, DefaultSession } from "next-auth";
import { format } from "date-fns";
import { ChevronDown, Info, Check, AlertCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { useTransactionStore } from "@/features/orders/transactions/store";
import { TransactionStatus } from "@/features/orders/transactions/types";
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
  RefreshCcw,
  ShoppingBag,
  ExternalLink,
  Mail,
  Phone,
  FileText,
  Calendar,
} from "lucide-react";

interface ExtendedUser extends User {
  tenant_id?: string;
}

const OrderPage = () => {
  const params = useParams();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "payment">(
    "overview"
  );
  const [hasFetchedTransaction, setHasFetchedTransaction] = useState(false);
  const [loadedVendors, setLoadedVendors] = useState<Record<string, boolean>>(
    {}
  );

  const { data: session } = useSession();
  const router = useRouter();

  const {
    order,
    loading: orderLoading,
    error: orderError,
    fetchOrder,
    clearStore,
  } = useOrderStore();
  const { vendor, loading: vendorLoading, fetchVendor } = useVendorStore();
  const {
    currentTransaction,
    fetchTransaction,
    loading: transactionLoading,
    setCurrentTransaction,
  } = useTransactionStore();

  const getTransactionStatusBadgeVariant = (status?: string) => {
    if (!status) return "secondary";

    const statusLower = status.toLowerCase();

    if (["completed", "succeeded", "paid", "success"].includes(statusLower)) {
      return "success";
    } else if (["pending", "processing"].includes(statusLower)) {
      return "warning";
    } else if (
      ["failed", "canceled", "cancelled", "declined"].includes(statusLower)
    ) {
      return "destructive";
    } else if (["refunded", "partially_refunded"].includes(statusLower)) {
      return "outline";
    }

    return "secondary";
  };

  const getStatusBadgeVariant = (status?: string) => {
    if (!status) return "secondary";
    return getTransactionStatusBadgeVariant(status);
  };

  const getPaymentStatusBadgeVariant = (status?: string) => {
    if (!status) return "default";
    return getTransactionStatusBadgeVariant(status);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not specified";
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };

  const formatPrice = (
    price: number | string | undefined,
    options?: { currency?: string }
  ): string => {
    if (price === undefined || price === null || price === "") return "N/A";
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(numPrice)) return "N/A";

    // Get the order from the store
    const order = useOrderStore.getState().order;
    const currency = options?.currency || order?.currency || "USD";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numPrice);
  };

  const formatTransactionDate = (dateString?: string | null): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid date";
    }
  };

  // Reset state when component unmounts or orderId changes
  useEffect(() => {
    return () => {
      // Clear the order store when component unmounts or orderId changes
      clearStore();
      setCurrentTransaction(null);
      setHasFetchedTransaction(false);
    };
  }, [orderId, clearStore, setCurrentTransaction]);

  // Fetch order data when component mounts or ID changes
  useEffect(() => {
    if (!orderId || !session?.user) return;

    // Reset states when orderId changes
    clearStore();
    setCurrentTransaction(null);
    setHasFetchedTransaction(false);

    const headers: Record<string, string> = {};

    // Type assertion for user with tenant_id
    const user = session.user as any;
    if (user?.tenant_id) {
      headers["X-Tenant-ID"] = user.tenant_id;
    }

    if (user?.accessToken) {
      headers["Authorization"] = `Bearer ${user.accessToken}`;
    }

    fetchOrder(orderId, headers);
  }, [orderId, session?.user, fetchOrder]);

  // Fetch transaction details when payment tab is active
  useEffect(() => {
    const fetchTransactionData = async () => {
      if (
        activeTab === "payment" &&
        order?.payment_details?.transaction_id &&
        !hasFetchedTransaction &&
        session?.user?.tenant_id
      ) {
        try {
          await fetchTransaction(order.payment_details.transaction_id, {
            "X-Tenant-ID": session.user.tenant_id,
          });
          setHasFetchedTransaction(true);
        } catch (error) {
          console.error("Error fetching transaction:", error);
          toast.error("Failed to load transaction details");
        }
      }
    };

    fetchTransactionData();
  }, [
    activeTab,
    order?.payment_details?.transaction_id,
    hasFetchedTransaction,
    session?.user?.tenant_id,
    fetchTransaction,
  ]);

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
          <Tabs
            defaultValue="overview"
            className="space-y-6 w-full"
            onValueChange={setActiveTab}
            value={activeTab}
          >
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
                      {order?.items?.map((item, index) => (
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
              {/* Combined Payment & Transaction Card */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-muted/30 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-3">
                        <CreditCard className="h-5 w-5" />
                        Payment Details
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {currentTransaction?.transaction_id ? (
                          <span className="font-mono text-sm">
                            {currentTransaction.transaction_id}
                          </span>
                        ) : (
                          "Loading transaction details..."
                        )}
                      </CardDescription>
                    </div>
                    {currentTransaction && (
                      <Badge
                        variant={getTransactionStatusBadgeVariant(
                          currentTransaction.status
                        )}
                        className="px-3 py-1.5 text-sm h-8 self-start sm:self-center"
                      >
                        {currentTransaction.status.replace(/_/g, " ")}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {transactionLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Spinner className="mb-3" />
                      <p className="text-muted-foreground">
                        Loading payment details...
                      </p>
                    </div>
                  ) : currentTransaction ? (
                    <div className="divide-y">
                      {/* Payment Summary */}
                      <div className="p-6">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">
                          PAYMENT SUMMARY
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Order Amount
                            </span>
                            <span className="font-medium">
                              {formatPrice(order?.totals?.total || 0, {
                                currency: order?.currency || "TZS",
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Amount Paid
                            </span>
                            <span className="font-medium">
                              {formatPrice(currentTransaction.amount, {
                                currency: order?.currency || "TZS",
                              })}
                            </span>
                          </div>
                          {order?.payment_details?.remaining_balance !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Remaining Balance
                              </span>
                              <span className="font-medium">
                                {formatPrice(order.payment_details.remaining_balance, {
                                  currency: order.currency || "TZS",
                                })}
                              </span>
                            </div>
                          )}
                          {currentTransaction.fee_amount && (
                            <div className="flex justify-between pt-2 border-t">
                              <span className="text-muted-foreground">
                                Transaction Fee
                              </span>
                              <span>
                                {formatPrice(currentTransaction.fee_amount, {
                                  currency: order?.currency || "TZS",
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Transaction Details */}
                      <div className="p-6">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">
                          TRANSACTION DETAILS
                        </h3>
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">
                                Reference
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">
                                  {currentTransaction.reference || "N/A"}
                                </p>
                                <Copy
                                  content={currentTransaction.reference}
                                  className="text-muted-foreground"
                                />
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">
                                Payment Method
                              </p>
                              <div className="flex items-center gap-2">
                                {currentTransaction.raw_request
                                  ?.payment_method || "Mobile Money"}
                              </div>
                            </div>
                            {currentTransaction.raw_request
                              ?.customer_msisdn && (
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  Customer Phone
                                </p>
                                <p>
                                  {
                                    currentTransaction.raw_request
                                      .customer_msisdn
                                  }
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">
                                Initiated
                              </p>
                              <p>
                                {formatTransactionDate(
                                  currentTransaction.created_at
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">
                                Last Updated
                              </p>
                              <p>
                                {formatTransactionDate(
                                  currentTransaction.updated_at
                                )}
                              </p>
                            </div>
                            {currentTransaction.payment_date && (
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  Completed
                                </p>
                                <p>
                                  {formatTransactionDate(
                                    currentTransaction.payment_date
                                  )}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>



                      {/* Raw Response */}
                      {currentTransaction.raw_response && (
                        <div className="border-t">
                          <Accordion type="single" collapsible>
                            <AccordionItem
                              value="raw-response"
                              className="border-b-0"
                            >
                              <AccordionTrigger className="hover:no-underline px-6 py-3 text-sm font-medium hover:bg-muted/30 transition-colors">
                                <span>View Raw Response</span>
                              </AccordionTrigger>
                              <AccordionContent className="px-6 pb-4 pt-1">
                                <div className="bg-muted/30 p-3 rounded-md">
                                  <pre className="text-xs overflow-x-auto">
                                    {JSON.stringify(
                                      currentTransaction.raw_response,
                                      null,
                                      2
                                    )}
                                  </pre>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No transaction details available</p>
                    </div>
                  )}
                </CardContent>

                {/* Installment Plan Card - Only show if order has a plan */}
                {order?.plan && (
                  <div className="border-t">
                    <Card className="border-0 rounded-none">
                      <CardHeader className="p-6 pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            Installment Plan
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="px-2.5">
                              {order.payment_details?.paid_installments || 0}/{order.plan.installments?.length || 0} Paid
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-6 pb-6 pt-0">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{order.plan.name || 'Installment Plan'}</p>
                              {order.plan.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {order.plan.description}
                                </p>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {order.plan.installments?.length || 0} installments
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Payment Progress</span>
                              <span className="font-medium">
                                {Math.round(((order.payment_details?.paid_installments || 0) / (order.plan.installments?.length || 1)) * 100)}%
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary"
                                style={{
                                  width: `${((order.payment_details?.paid_installments || 0) / (order.plan.installments?.length || 1)) * 100}%`,
                                  transition: 'width 0.3s ease-in-out'
                                }}
                              />
                            </div>
                          </div>

                          {/* Installment Summary */}
                          <div className="border rounded-md">
                            <Accordion type="single" collapsible>
                              <AccordionItem value="installment-details" className="border-b-0">
                                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30">
                                  <span className="text-sm font-medium">View Installment Details</span>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-4 pt-1">
                                  <div className="space-y-3 mt-2">
                                    {order.plan.installments?.map((installment, index) => {
                                      const isPaid = index < (order.payment_details?.paid_installments || 0);
                                      const isCurrent = index === (order.payment_details?.paid_installments || 0);
                                      const dueDate = new Date(installment.due_date);
                                      const today = new Date();
                                      today.setHours(0, 0, 0, 0);
                                      const isOverdue = !isPaid && dueDate < today;

                                      return (
                                        <div 
                                          key={index}
                                          className={`p-3 rounded-md border ${
                                            isOverdue ? 'border-red-200 bg-red-50' : 
                                            isCurrent ? 'border-primary/50 bg-primary/5' : 'border-border'
                                          }`}
                                        >
                                          <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                                isPaid ? 'bg-green-100 text-green-600' : 
                                                isOverdue ? 'bg-red-100 text-red-600' :
                                                isCurrent ? 'bg-blue-100 text-blue-600' : 'bg-muted'
                                              }`}>
                                                {isPaid ? (
                                                  <Check className="h-4 w-4" />
                                                ) : isOverdue ? (
                                                  <span className="text-xs font-medium">!</span>
                                                ) : (
                                                  <span className="text-xs font-medium">{index + 1}</span>
                                                )}
                                              </div>
                                              <div>
                                                <p className={`text-sm font-medium ${isOverdue ? 'text-red-700' : ''}`}>
                                                  Installment {index + 1}
                                                  {isOverdue && <span className="ml-2 text-xs text-red-500">(Overdue)</span>}
                                                </p>
                                                <p className={`text-xs ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
                                                  Due {dueDate.toLocaleDateString()}
                                                </p>
                                              </div>
                                            </div>
                                            <div className="text-right">
                                              <p className={`font-medium ${isOverdue ? 'text-red-700' : ''}`}>
                                                {formatPrice(installment.amount, { currency: order?.currency || 'TZS' })}
                                              </p>
                                              <p className={`text-xs ${
                                                isPaid ? 'text-green-600' : 
                                                isOverdue ? 'text-red-600 font-medium' :
                                                isCurrent ? 'text-blue-600 font-medium' : 'text-muted-foreground'
                                              }`}>
                                                {isPaid ? 'Paid' : isOverdue ? 'Overdue' : isCurrent ? 'Upcoming' : 'Pending'}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </Card>
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
                      -{formatPrice(order?.totals?.discount) || "TZS 0.00"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">
                      {formatPrice(order?.totals?.tax) || "TZS 0.00"}
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
