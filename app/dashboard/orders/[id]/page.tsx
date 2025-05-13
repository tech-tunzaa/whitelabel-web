"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { use } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ErrorCard } from "@/components/ui/error-card";

import { OrderDetails } from "@/features/orders/components/order-details";
import { OrderTimeline } from "@/features/orders/components/order-timeline";
import { OrderItems } from "@/features/orders/components/order-items";
import { CustomerInfo } from "@/features/orders/components/customer-info";
import { ShippingInfo } from "@/features/orders/components/shipping-info";
import { PaymentInfo } from "@/features/orders/components/payment-info";
import { OrderActions } from "@/features/orders/components/order-actions";
import { useOrderStore } from "@/features/orders/store";
import { Order } from "@/features/orders/types";

interface OrderPageProps {
  params: {
    id: string;
  };
}

export default function OrderPage({ params: paramsPromise }: OrderPageProps) {
  const router = useRouter();
  const { order, loading, storeError, fetchOrder, updateOrderStatus, updatePaymentStatus, createRefund } = useOrderStore();
  const params = use(paramsPromise);
  const { id } = params;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define tenant headers
  const tenantHeaders = {
    'X-Tenant-ID': '4c56d0c3-55d9-495b-ae26-0d922d430a42'
  };

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await fetchOrder(id, tenantHeaders);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err instanceof Error ? err.message : 'Failed to load order');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [id, fetchOrder]);

  const handleUpdateStatus = async (status: string) => {
    try {
      await updateOrderStatus(id, status as any, tenantHeaders);
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const handleUpdatePayment = async (paymentStatus: string) => {
    try {
      await updatePaymentStatus(id, paymentStatus as any, tenantHeaders);
    } catch (err) {
      console.error('Error updating payment status:', err);
    }
  };

  const handleRefund = async (refundData: any) => {
    try {
      await createRefund(id, refundData, tenantHeaders);
    } catch (err) {
      console.error('Error creating refund:', err);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Order Details</h1>
            <p className="text-muted-foreground">
              Loading order information...
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || storeError || !order) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Order Not Found</h1>
            <p className="text-muted-foreground">
              {error || (storeError ? storeError.message : 'The order you are looking for does not exist.')}
            </p>
          </div>
        </div>
        <div className="p-4">
          <ErrorCard
            title="Failed to load order"
            error={{ 
              message: error || (storeError ? storeError.message : 'Order not found'), 
              status: storeError?.status || 404 
            }}
            buttonText="Back to Orders"
            buttonAction={() => router.push("/dashboard/orders")}
            buttonIcon={ArrowLeft}
          />
        </div>
      </div>
    );
  }

  // Format the created_at date for display
  const orderDate = new Date(order.created_at);
  const formattedDate = orderDate.toLocaleDateString('en-US');
  const formattedTime = orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

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
            Order #{order.order_number}
          </h1>
          <p className="text-sm text-muted-foreground">
            {formattedDate} {formattedTime}
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

            {/* Since the API doesn't provide timeline information directly, 
                we'll create a simple order status history */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between border-b pb-2 mb-2">
                  <div>
                    <div className="font-medium">Current Status</div>
                    <div className="text-sm text-muted-foreground">Last updated {formattedDate}</div>
                  </div>
                  <Badge variant={order.status === 'delivered' || order.status === 'completed' ? 'success' : 
                                 order.status === 'cancelled' ? 'destructive' : 
                                 order.status === 'processing' ? 'warning' : 'secondary'}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between border-b pb-2 mb-2">
                  <div>
                    <div className="font-medium">Payment Status</div>
                    <div className="text-sm text-muted-foreground">Last updated {formattedDate}</div>
                  </div>
                  <Badge variant={order.payment_details.status === 'paid' ? 'success' : 
                                 order.payment_details.status === 'failed' ? 'destructive' : 
                                 'secondary'}>
                    {order.payment_details.status.charAt(0).toUpperCase() + order.payment_details.status.slice(1)}
                  </Badge>
                </div>
                {order.refunds && order.refunds.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Refund Status</div>
                      <div className="text-sm text-muted-foreground">Issued on {new Date(order.refunds[0].issued_at).toLocaleDateString('en-US')}</div>
                    </div>
                    <Badge variant={order.refunds[0].status === 'approved' ? 'success' : 
                                   order.refunds[0].status === 'rejected' ? 'destructive' : 
                                   'secondary'}>
                      {order.refunds[0].status.charAt(0).toUpperCase() + order.refunds[0].status.slice(1)}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-[100px_1fr] gap-1">
                    <div className="text-sm font-medium text-muted-foreground">Name</div>
                    <div>{order.customer.name}</div>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-1">
                    <div className="text-sm font-medium text-muted-foreground">Email</div>
                    <div>{order.customer.email}</div>
                  </div>
                  {order.customer.phone && (
                    <div className="grid grid-cols-[100px_1fr] gap-1">
                      <div className="text-sm font-medium text-muted-foreground">Phone</div>
                      <div>{order.customer.phone}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>{order.shipping_address.first_name} {order.shipping_address.last_name}</div>
                  <div>{order.shipping_address.address_line1}</div>
                  {order.shipping_address.address_line2 && <div>{order.shipping_address.address_line2}</div>}
                  <div>
                    {order.shipping_address.city}, {order.shipping_address.state_province} {order.shipping_address.postal_code}
                  </div>
                  <div>{order.shipping_address.country}</div>
                  <div>{order.shipping_address.phone}</div>
                  <div>{order.shipping_address.email}</div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-[120px_1fr] gap-1">
                    <div className="text-sm font-medium text-muted-foreground">Method</div>
                    <div className="capitalize">{order.payment_details.method.replace('_', ' ')}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-1">
                    <div className="text-sm font-medium text-muted-foreground">Status</div>
                    <div className="capitalize">{order.payment_details.status.replace('_', ' ')}</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-1">
                    <div className="text-sm font-medium text-muted-foreground">Amount</div>
                    <div>{order.payment_details.amount.toFixed(2)} {order.payment_details.currency}</div>
                  </div>
                  {order.payment_details.transaction_id && (
                    <div className="grid grid-cols-[120px_1fr] gap-1">
                      <div className="text-sm font-medium text-muted-foreground">Transaction ID</div>
                      <div>{order.payment_details.transaction_id}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Order Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Update Order Status */}
                  <div>
                    <div className="text-sm font-medium mb-2">Update Status</div>
                    <div className="flex flex-wrap gap-2">
                      {['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'].map((status) => (
                        <Button 
                          key={status} 
                          size="sm" 
                          variant={order.status === status ? 'default' : 'outline'}
                          onClick={() => handleUpdateStatus(status)}
                          disabled={order.status === status}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Update Payment Status */}
                  <div>
                    <div className="text-sm font-medium mb-2">Update Payment</div>
                    <div className="flex flex-wrap gap-2">
                      {['paid', 'pending', 'authorized', 'captured', 'failed', 'cancelled'].map((status) => (
                        <Button 
                          key={status} 
                          size="sm" 
                          variant={order.payment_details.status === status ? 'default' : 'outline'}
                          onClick={() => handleUpdatePayment(status)}
                          disabled={order.payment_details.status === status}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Refund Action */}
                  {order.payment_details.status === 'paid' && !order.refunds?.length && (
                    <div>
                      <div className="text-sm font-medium mb-2">Refund</div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRefund({
                          issued_by: "Admin",
                          refund_data: {
                            amount: order.total
                          }
                        })}
                      >
                        Issue Refund
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
