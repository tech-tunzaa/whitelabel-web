"use client";

import * as React from "react";
import { useState, useEffect } from "react";
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
  MapPin, 
  CreditCard, 
  Clock, 
  User,
  Copy,
  FileText,
  DollarSign,
  Phone,
  Mail,
  Edit,
  UserCheck,
  UserX
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useOrderStore } from "@/features/orders/store";
import { Order, OrderStatus, PaymentStatus } from "@/features/orders/types";
import { useDeliveryPartnerStore } from "@/features/delivery-partners/store";
import { DeliveryPartner } from "@/features/delivery-partners/types";

interface OrderPageProps {
  params: {
    id: string;
  };
}

// Helper functions for order status display
const getOrderStatusBadge = (status: string): { variant: string, icon: any } => {
  const statusMap: Record<string, { variant: string, icon: any }> = {
    'pending': { variant: 'outline', icon: Package },
    'processing': { variant: 'secondary', icon: Package },
    'confirmed': { variant: 'default', icon: FileCheck },
    'shipped': { variant: 'primary', icon: Truck },
    'delivered': { variant: 'secondary', icon: CheckCircle2 },
    'completed': { variant: 'success', icon: CheckCircle2 },
    'cancelled': { variant: 'destructive', icon: Ban },
    'refunded': { variant: 'warning', icon: RefreshCw },
    'partially_refunded': { variant: 'warning', icon: RefreshCw }
  };
  
  return statusMap[status] || { variant: 'secondary', icon: ShieldAlert };
};

const getPaymentStatusBadge = (status: string): { variant: string, icon: any } => {
  const statusMap: Record<string, { variant: string, icon: any }> = {
    'pending': { variant: 'outline', icon: Clock },
    'authorized': { variant: 'primary', icon: FileCheck },
    'paid': { variant: 'success', icon: CheckCircle2 },
    'failed': { variant: 'destructive', icon: Ban },
    'refunded': { variant: 'warning', icon: RefreshCw },
    'partially_refunded': { variant: 'warning', icon: RefreshCw }
  };
  
  return statusMap[status] || { variant: 'secondary', icon: ShieldAlert };
};

const formatCurrency = (amount: number, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    return format(date, "PPP");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

const formatStatus = (status: string | undefined) => {
  if (!status) return 'Unknown';
  return status
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getAvailableStatusTransitions = (currentStatus: string | undefined): OrderStatus[] => {
  if (!currentStatus) return [];
  
  const transitions: Record<string, OrderStatus[]> = {
    "pending": ["processing", "cancelled"],
    "processing": ["confirmed", "cancelled"],
    "confirmed": ["shipped", "cancelled"],
    "shipped": ["delivered", "cancelled"],
    "delivered": ["completed", "cancelled"],
    "completed": [],
    "cancelled": [],
    "refunded": [],
    "partially_refunded": []
  };
  
  return transitions[currentStatus] || [];
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
};

export default function OrderPage({ params }: OrderPageProps) {
  const router = useRouter();
  const session = useSession();
  const tenantId = session?.data?.user ? (session.data.user as any).tenant_id : undefined;
  const id = params.id;
  
  // Order store
  const { order, storeError, setStoreError, updateOrderStatus, updatePaymentStatus, createRefund, fetchOrder, loading, updateOrder } = useOrderStore();
  
  // Delivery partner store
  const deliveryPartnerStore = useDeliveryPartnerStore();
  const { deliveryPartners, fetchDeliveryPartners, updateDeliveryPartner } = deliveryPartnerStore;

  // Local state
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [refundReason, setRefundReason] = useState<string>('');
  const [processingRefund, setProcessingRefund] = useState(false);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');

  // Tenant headers
  const tenantHeaders = {
    "X-Tenant-ID": tenantId
  };

  // Load order data
  const loadOrder = async () => {
    if (id) {
      try {
        setStoreError(null); // Reset error state before loading
        await fetchOrder(id, tenantHeaders);
      } catch (error) {
        console.error("Error loading order:", error);
        // No need to manually set error here since the store already handles it
      }
    }
  };
  
  // Load delivery partners
  const loadDeliveryPartners = async () => {
    if (tenantId) {
      try {
        setLoadingPartners(true);
        await fetchDeliveryPartners({}, tenantHeaders);
      } catch (error) {
        console.error("Error loading delivery partners:", error);
      } finally {
        setLoadingPartners(false);
      }
    }
  };
  
  // Handle delivery partner assignment
  const handleAssignDeliveryPartner = async () => {
    if (!selectedPartnerId || !id) {
      toast.error("Please select a delivery partner");
      return;
    }
    
    try {
      // Get the current delivery details or create a new one
      const currentDeliveryDetails = order?.delivery_details || { cost: 0 };
      
      // Update the order with the selected delivery partner
      const result = await updateOrder(id, { 
        delivery_details: {
          ...currentDeliveryDetails,
          partner_id: selectedPartnerId
        }
      });
      
      if (result) {
        toast.success("Delivery partner assigned successfully");
        setIsPartnerDialogOpen(false);
        loadOrder(); // Refresh order data
      }
    } catch (error) {
      console.error("Error assigning delivery partner:", error);
      toast.error("Failed to assign delivery partner");
    }
  };

  useEffect(() => {
    if (tenantId) {
      loadOrder();
      loadDeliveryPartners();
    }
  }, [id, tenantId]);

  // Handle status update
  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    try {
      // Clear any previous error state before making the update
      setStoreError(null);
      
      try {
        // Attempt to update the status
        const result = await updateOrderStatus(id, newStatus, tenantHeaders);
        if (result) {
          toast.success(`Order status updated to ${formatStatus(newStatus)}`);
          // Refresh the order data to ensure UI is in sync
          await loadOrder();
          // Set flag in localStorage so orders list knows to refresh
          localStorage.setItem('ordersNeedRefresh', 'true');
        }
      } catch (apiError) {
        console.error("API error during status update:", apiError);
        
        // Check if the status was actually updated despite the error
        // This helps handle cases where the API returned 200 but parsing failed
        if ((apiError as any)?.response?.status === 200) {
          toast.success(`Order status updated to ${formatStatus(newStatus)}`);
          // Refresh the order data to ensure UI is in sync
          await loadOrder();
          // Set flag in localStorage so orders list knows to refresh
          localStorage.setItem('ordersNeedRefresh', 'true');
        } else {
          // Only show error for genuine API failures
          toast.error("Failed to update order status");
        }
      }
    } catch (error) {
      console.error("Unexpected error in handleUpdateStatus:", error);
      toast.error("An unexpected error occurred");
    }
  };
  
  // Handle payment status update
  const handleUpdatePayment = async (newStatus: PaymentStatus) => {
    try {
      // Clear any previous error state before making the update
      setStoreError(null);
      
      // Show toast only after successful API response
      const updatedOrder = await updatePaymentStatus(id, newStatus, tenantHeaders);
      if (updatedOrder) {
        toast.success(`Payment status updated to ${formatStatus(newStatus)}`);
        // Set flag in localStorage so orders list knows to refresh
        localStorage.setItem('ordersNeedRefresh', 'true');
      }
    } catch (error) {
      toast.error("Failed to update payment status");
    }
  };
  
  // Handle refund
  const handleRefund = () => {
    if (order) {
      // Prefill with full amount
      setRefundAmount(String(order?.totals?.total || 0));
      setRefundReason('');
      setIsRefundDialogOpen(true);
    }
  };
  
  // Process refund
  const processRefund = async () => {
    if (!order || !refundAmount) {
      toast.error("Please enter a valid refund amount");
      return;
    }
    
    try {
      // Clear any previous error state before making the update
      setStoreError(null);
      setProcessingRefund(true);

      const refundData = {
        issued_by: session?.data?.user?.name || "Unknown",
        refund_data: {
          amount: parseFloat(refundAmount),
          reason: refundReason || "Customer requested refund"
        }
      };
      
      // Wait for the API response before showing success toast
      const result = await createRefund(id, refundData, tenantHeaders);
      
      if (result) {
        toast.success("Refund processed successfully");
        setIsRefundDialogOpen(false);
        
        // No need to reload order, as createRefund already updates the state
      }
    } catch (error) {
      toast.error("Failed to process refund");
      console.error("Refund error:", error);
    } finally {
      setProcessingRefund(false);
    }
  };

  if (loading && !order) {
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
          status: storeError?.status ? String(storeError.status) : "error"
        }}
        buttonText="Back to Orders"
        buttonAction={() => router.push("/dashboard/orders")}
        buttonIcon={ArrowLeft}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/orders')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Order #{order?.order_number || params.id}</h1>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
                onClick={() => copyToClipboard(order?.order_number || params.id)}
                title="Copy order number"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Badge 
                variant={getOrderStatusBadge(order?.status || 'pending').variant as "default" | "secondary" | "destructive" | "outline" | "primary" | "success" | "warning"}
                className="flex items-center gap-1 ml-2 px-2 py-1"
              >
                {React.createElement(getOrderStatusBadge(order?.status || 'pending').icon, { className: "h-3 w-3" })}
                <span className="capitalize">{formatStatus(order?.status || 'pending')}</span>
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-1 mt-1">
              <Calendar className="h-3 w-3" /> Placed on {formatDate(order?.created_at || new Date().toISOString())}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {order && order?.payment_status === 'paid' && order?.refunds?.length === 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleRefund()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Process Refund
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column with order details */}
          <div className="md:col-span-2 space-y-6">
            {/* Order Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" /> 
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Order Number</div>
                      <div className="font-medium">#{order?.order_number}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Date Placed</div>
                      <div>{formatDate(order?.created_at)}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
                      <div>{formatDate(order?.updated_at)}</div>
                    </div>
                    {order?.status === 'completed' && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Fulfilled On</div>
                        <div>{formatDate(order?.updated_at || order?.created_at)}</div>
                      </div>
                    )}
                    {order?.status === 'cancelled' && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Cancelled On</div>
                        <div>{formatDate(order?.cancelled_at || order?.updated_at || order?.created_at)}</div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Order Status</div>
                      <div className="flex items-center gap-1">
                        <Badge 
                          variant={getOrderStatusBadge(order?.status || 'pending').variant as "default" | "secondary" | "destructive" | "outline" | "primary" | "success" | "warning"}
                        >
                          {React.createElement(getOrderStatusBadge(order?.status || 'pending').icon, { className: "h-3 w-3 mr-1" })}
                          {formatStatus(order?.status || 'pending')}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Payment Status</div>
                      <div className="flex items-center gap-1">
                        <Badge 
                          variant={getPaymentStatusBadge(order?.payment_status || 'pending').variant as "default" | "secondary" | "destructive" | "outline" | "primary" | "success" | "warning"}
                        >
                          {React.createElement(getPaymentStatusBadge(order?.payment_status || 'pending').icon, { className: "h-3 w-3 mr-1" })}
                          {formatStatus(order?.payment_status || 'pending')}
                        </Badge>
                      </div>
                    </div>
                    {order?.notes && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Order Notes</div>
                        <div className="text-sm">{order?.notes}</div>
                      </div>
                    )}
                    {order?.totals?.tax > 0 && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Tax</div>
                        <div className="text-sm">{formatCurrency(order?.totals.tax || 0, order?.currency)}</div>
                      </div>
                    )}
                    {order?.totals?.discount > 0 && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Discount</div>
                        <div className="text-sm">{formatCurrency(order?.totals.discount || 0, order?.currency)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items
                </CardTitle>
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
                    {order?.items.map((item) => (
                      <TableRow key={item.item_id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.unit_price, order?.currency || 'USD')}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.total, order?.currency || 'USD')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="grid grid-cols-[100px_1fr] gap-1">
                    <div className="text-sm font-medium text-muted-foreground">Name</div>
                    <div>{order?.shipping_address.first_name} {order?.shipping_address.last_name}</div>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-1">
                    <div className="text-sm font-medium text-muted-foreground">Email</div>
                    <div>{order?.shipping_address.email}</div>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-1">
                    <div className="text-sm font-medium text-muted-foreground">Phone</div>
                    <div>{order?.shipping_address.phone}</div>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-1">
                    <div className="text-sm font-medium text-muted-foreground">User ID</div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-mono">{order?.user_id}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Shipping Address</div>
                  <div className="font-medium">{order?.shipping_address.first_name} {order?.shipping_address.last_name}</div>
                  <div>{order?.shipping_address.address_line1}</div>
                  {order?.shipping_address.address_line2 && (
                    <div>{order?.shipping_address.address_line2}</div>
                  )}
                  <div>
                    {order?.shipping_address.city}, {order?.shipping_address.state_province} {order?.shipping_address.postal_code}
                  </div>
                  <div>{order?.shipping_address.country}</div>
                </div>
              </CardContent>
            </Card>
            
            {/* Order Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Order Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Update Order Status */}
                  <div>
                    <div className="text-sm font-medium mb-2">Update Status</div>
                    <div className="flex flex-wrap gap-2">
                      {getAvailableStatusTransitions(order?.status).map((status) => (
                        <Button 
                          key={status} 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUpdateStatus(status)}
                        >
                          {formatStatus(status)}
                        </Button>
                      ))}
                      {getAvailableStatusTransitions(order?.status).length === 0 && (
                        <p className="text-sm text-muted-foreground">No status transitions available for {formatStatus(order?.status)} orders.</p>
                      )}
                    </div>
                  </div>

                  {/* Update Payment Status */}
                  <div>
                    <div className="text-sm font-medium mb-2">Update Payment Status</div>
                    <div className="flex flex-wrap gap-2">
                      {['pending', 'authorized', 'paid', 'failed', 'refunded', 'partially_refunded'].map((status) => (
                        <Button 
                          key={status} 
                          size="sm" 
                          variant={order?.payment_status === status ? 'default' : 'outline'}
                          onClick={() => handleUpdatePayment(status as PaymentStatus)}
                          disabled={order?.payment_status === status}
                        >
                          {formatStatus(status)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Order Summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="font-medium">Status</div>
                    <Badge 
                      variant={getOrderStatusBadge(order?.status || 'pending').variant as "default" | "secondary" | "destructive" | "outline" | "primary" | "success" | "warning"}
                    >
                      {formatStatus(order?.status || 'pending')}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <div className="font-medium">Date</div>
                    <div>{formatDate(order?.created_at || new Date().toISOString())}</div>
                  </div>
                  
                  <div className="flex justify-between">
                    <div className="font-medium">Items</div>
                    <div>{order?.items?.length || 0}</div>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="space-y-4">
                  <div className="flex justify-between">
                    <div className="font-medium">Subtotal</div>
                    <div>{formatCurrency(order?.totals?.subtotal || 0, order?.currency || 'USD')}</div>
                  </div>
                                    {/* Shipping cost - assumed to be 0 if not available */}
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>{formatCurrency(0, order?.currency)}</span>
                    </div>
                  
                  {order?.totals?.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>{formatCurrency(order?.totals.tax || 0, order?.currency)}</span>
                    </div>
                  )}
                                    {order?.totals?.discount && order?.totals.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Discount</span>
                        <span>-{formatCurrency(order?.totals.discount, order?.currency)}</span>
                      </div>
                    )}
                </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex justify-between font-bold">
                    <div>Total</div>
                    <div>{formatCurrency(order?.totals?.total || 0, order?.currency || 'USD')}</div>
                  </div>
                </div>
                
                {order?.payment_status && (
                  <div>
                    <div className="font-medium mb-2">Payment</div>
                    <Badge 
                      variant={getPaymentStatusBadge(order?.payment_status || 'pending').variant as "default" | "secondary" | "destructive" | "outline" | "primary" | "success" | "warning"}
                      className="flex items-center gap-1"
                    >
                      {React.createElement(getPaymentStatusBadge(order?.payment_status || 'pending').icon, { className: "h-3 w-3 mr-1" })}
                      {formatStatus(order?.payment_status || 'pending')}
                    </Badge>
                  </div>
                )}
                
                {order?.payment_details && (
                  <div>
                    <div className="font-medium mb-2">Payment Details</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <div className="text-muted-foreground">Method</div>
                        <div className="capitalize">{formatStatus(order?.payment_details.method)}</div>
                      </div>
                      {order?.payment_details.transaction_id && (
                        <div className="flex justify-between">
                          <div className="text-muted-foreground">Transaction ID</div>
                          <div className="flex items-center gap-1">
                            <span className="truncate max-w-[120px]">{order?.payment_details.transaction_id}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Delivery Partner Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery Partner
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order?.delivery_details?.partner_id ? (
                  <div className="space-y-4">
                    {/* Find the delivery partner in the list */}
                    {deliveryPartners.find(p => p.id === order?.delivery_details?.partner_id) ? (
                      <div>
                        {/* Display delivery partner information if found */}
                        {(() => {
                          const partner = deliveryPartners.find(p => p.id === order?.delivery_details?.partner_id);
                          return (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <UserCheck className="h-4 w-4 text-green-500" />
                                <span className="font-medium">{partner?.name || 'Unknown Partner'}</span>
                                <Badge variant="outline">{partner?.status || 'Unknown'}</Badge>
                              </div>
                              
                              {partner?.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <span>{partner.phone}</span>
                                </div>
                              )}
                              
                              {partner?.email && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="h-4 w-4 text-muted-foreground" />
                                  <span>{partner.email}</span>
                                </div>
                              )}
                              
                              {partner?.vehicle?.plate_number && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Truck className="h-4 w-4 text-muted-foreground" />
                                  <span>Vehicle: {partner.vehicle.plate_number}</span>
                                </div>
                              )}

                              {/* Display delivery details */}
                              {order?.delivery_details?.cost > 0 && (
                                <div className="flex items-center gap-2 text-sm">
                                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                                  <span>Delivery Cost: {formatCurrency(order?.delivery_details.cost, order?.currency || 'TZS')}</span>
                                </div>
                              )}

                              {order?.delivery_details?.tracking_number && (
                                <div className="flex items-center gap-2 text-sm">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span>Tracking: {order?.delivery_details.tracking_number}</span>
                                </div>
                              )}

                              {order?.delivery_details?.status && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>Status: {order?.delivery_details.status}</span>
                                </div>
                              )}
                            </div>
                          );
                        })()} 
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Delivery partner information not available
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2" 
                      onClick={() => {
                        setSelectedPartnerId(order?.delivery_details?.partner_id || '');
                        setIsPartnerDialogOpen(true);
                      }}
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Reassign Delivery Partner
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm text-muted-foreground mb-4">
                      No delivery partner assigned to this order?.
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSelectedPartnerId('');
                        setIsPartnerDialogOpen(true);
                      }}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Assign Delivery Partner
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Refund Information if available */}
            {order?.refunds && order?.refunds.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    Refunds
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order?.refunds.map((refund, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between">
                          <div className="text-sm font-medium">Amount</div>
                          <div>{formatCurrency(refund.amount, order?.currency || 'USD')}</div>
                        </div>
                        <div className="flex justify-between">
                          <div className="text-sm font-medium">Date</div>
                          <div>{formatDate(refund.created_at || new Date().toISOString())}</div>
                        </div>
                        {order?.status === 'cancelled' && order?.updated_at && (
                          <div className="flex justify-between">
                            <div className="text-sm font-medium">Cancelled Date</div>
                            <div>{formatDate(order?.updated_at)}</div>
                          </div>
                        )}
                        {refund.reason && (
                          <div>
                            <div className="text-sm font-medium">Reason</div>
                            <div className="text-sm text-muted-foreground">{refund.reason}</div>
                          </div>
                        )}
                        <Separator className="my-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Refund Dialog */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Enter the refund details below.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="refund-amount">Refund Amount</Label>
              <Input 
                id="refund-amount"
                type="number" 
                value={refundAmount} 
                onChange={(e) => setRefundAmount(e.target.value)} 
                placeholder="Amount to refund"
                max={parseFloat(String(order?.totals?.total || 0))}
              />
            </div>
            <div>
              <Label htmlFor="refund-reason">Reason (Optional)</Label>
              <Textarea 
                id="refund-reason"
                value={refundReason} 
                onChange={(e) => setRefundReason(e.target.value)} 
                placeholder="Reason for refund"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRefundDialogOpen(false)}
              disabled={processingRefund}
            >
              Cancel
            </Button>
            <Button 
              onClick={processRefund} 
              disabled={processingRefund || !refundAmount}
            >
              {processingRefund ? "Processing..." : "Process Refund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delivery Partner Selection Dialog */}
      <Dialog open={isPartnerDialogOpen} onOpenChange={setIsPartnerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{order?.delivery_details?.partner_id ? 'Reassign' : 'Assign'} Delivery Partner</DialogTitle>
            <DialogDescription>
              Select a delivery partner for this order?.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {loadingPartners ? (
              <div className="flex justify-center py-4">
                <Spinner size="md" />
              </div>
            ) : deliveryPartners.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                No delivery partners available
              </div>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {deliveryPartners.map((partner) => (
                  <div 
                    key={partner.id} 
                    className={`flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-accent ${selectedPartnerId === partner.id ? 'bg-accent border-primary' : ''}`}
                    onClick={() => setSelectedPartnerId(partner.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0">
                        <UserCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{partner.name}</div>
                        <div className="text-xs text-muted-foreground">{partner.phone}</div>
                      </div>
                    </div>
                    <Badge variant={partner.status === 'active' ? 'default' : 'secondary'}>
                      {partner.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsPartnerDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssignDeliveryPartner} 
              disabled={!selectedPartnerId || loadingPartners}
            >
              {order?.delivery_details?.partner_id ? 'Reassign Partner' : 'Assign Partner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
