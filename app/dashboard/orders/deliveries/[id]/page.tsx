"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useDeliveryStore } from '@/features/orders/deliveries/store';
import { useOrderStore } from '@/features/orders/store';
import { format } from 'date-fns';
import { ArrowLeft, Package, User, MapPin, Phone, Calendar, Clock, CheckCircle, XCircle, Truck, Info, ListOrdered, PackageCheck, Hourglass, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { ErrorCard } from '@/components/ui/error-card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeliveryStage } from '@/features/orders/deliveries/types';
import { OrderItem } from '@/features/orders/types';

const DeliveryStatusBadge = ({ status }: { status: string }) => {
  const statusStyles: { [key: string]: string } = {
    assigned: 'bg-blue-100 text-blue-800',
    at_pickup: 'bg-yellow-100 text-yellow-800',
    in_transit: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    failed: 'bg-gray-100 text-gray-800',
  };
  const statusIcons: { [key: string]: React.ReactNode } = {
    assigned: <Hourglass className="mr-1.5 h-3 w-3" />,
    at_pickup: <Package className="mr-1.5 h-3 w-3" />,
    in_transit: <Truck className="mr-1.5 h-3 w-3" />,
    delivered: <PackageCheck className="mr-1.5 h-3 w-3" />,
    cancelled: <XCircle className="mr-1.5 h-3 w-3" />,
    failed: <Info className="mr-1.5 h-3 w-3" />,
  };
  return (
    <Badge className={`capitalize ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {statusIcons[status] || null}
      {status.replace(/_/g, ' ')}
    </Badge>
  );
};

const TimelineItem = ({ stage, isLast }: { stage: DeliveryStage; isLast: boolean }) => {
  return (
    <div className="flex">
      <div className="flex flex-col items-center mr-4">
        <div>
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full text-primary-foreground">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        {!isLast && <div className="w-px h-full bg-gray-300" />}
      </div>
      <div className="pb-8">
        <p className="font-semibold capitalize">{stage.stage.replace(/_/g, ' ')}</p>
        <p className="text-sm text-gray-500">{format(new Date(stage.timestamp), 'PPpp')}</p>
        {stage.location && (
          <p className="text-xs text-gray-400">{`Lat: ${stage.location.latitude}, Lon: ${stage.location.longitude}`}</p>
        )}
      </div>
    </div>
  );
};

export default function DeliveryDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const deliveryId = params.id as string;
  const tenantId = session?.user?.tenant_id;

  const {
    delivery,
    loading: deliveryLoading,
    storeError: deliveryError,
    fetchDelivery,
  } = useDeliveryStore();

  const {
    order,
    loading: orderLoading,
    storeError: orderError,
    fetchOrder,
  } = useOrderStore();

  useEffect(() => {
    if (deliveryId && tenantId) {
      fetchDelivery(deliveryId, { 'X-Tenant-ID': tenantId });
    }
  }, [deliveryId, tenantId, fetchDelivery]);

  useEffect(() => {
    // Ensure we have a delivery and its order_id before fetching the order
    if (delivery?.order_id && tenantId) {
      fetchOrder(delivery.order_id, { 'X-Tenant-ID': tenantId });
    }
  }, [delivery, tenantId, fetchOrder]);

  const handleRetry = () => {
    if (deliveryId && tenantId) {
      fetchDelivery(deliveryId, { 'X-Tenant-ID': tenantId });
    }
  };

  // Combined loading state
  if (deliveryLoading || (delivery && !order && orderLoading)) {
    return <Spinner />;
  }

  // Error state for delivery
  if (deliveryError) {
    return (
      <ErrorCard
        title="Failed to load delivery details"
        error={{ status: deliveryError.status?.toString() || "Error", message: deliveryError.message }}
        buttonText="Retry"
        buttonAction={handleRetry}
        buttonIcon={AlertCircle}
      />
    );
  }

  // Not found state for delivery
  if (!delivery) {
    return (
       <ErrorCard
        title="Delivery Not Found"
        error={{ message: `No delivery with the ID '${deliveryId}' was found.` }}
        buttonText="Go Back"
        buttonAction={() => router.back()}
        buttonIcon={ArrowLeft}
      />
    );
  }
  
  // Error state for order
  if (orderError) {
     return (
      <ErrorCard
        title="Failed to load order details"
        error={{ status: orderError.status?.toString() || "Error", message: orderError.message }}
        buttonText="Retry"
        buttonAction={() => fetchOrder(delivery.order_id, { 'X-Tenant-ID': tenantId })}
        buttonIcon={AlertCircle}
      />
    );
  }

  // Not found state for order
  if (!order) {
    return (
       <ErrorCard
        title="Order Not Found"
        error={{ message: `The order associated with this delivery could not be loaded.` }}
        buttonText="Go Back"
        buttonAction={() => router.back()}
        buttonIcon={ArrowLeft}
      />
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between border-b p-4 md:p-6">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()} className="shrink-0">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
            </Button>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-full">
                    <Truck className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Order #{order.order_number}</h1>
                    <p className="text-muted-foreground text-sm">
                        Delivery ID: {delivery.id}
                    </p>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <DeliveryStatusBadge status={delivery.current_stage} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-0 p-4 md:p-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Delivery Status</span>
                <DeliveryStatusBadge status={delivery.current_stage} />
              </CardTitle>
              <CardDescription>
                Delivery ID: {delivery.id}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Package className="mr-3 h-5 w-5 text-gray-500" />
                <span>Order ID: {delivery.order_id}</span>
              </div>
              <div className="flex items-center">
                <User className="mr-3 h-5 w-5 text-gray-500" />
                <span>{`Customer: ${order.shipping_address.first_name} ${order.shipping_address.last_name}`}</span>
              </div>
              <div className="flex items-center">
                <Phone className="mr-3 h-5 w-5 text-gray-500" />
                <a href={`tel:${order.shipping_address.phone}`} className="hover:underline">
                  {order.shipping_address.phone}
                </a>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-3 h-5 w-5 text-gray-500" />
                <span>{order.shipping_address.address_line1}, {order.shipping_address.city}</span>
              </div>
              <Separator />
              <div className="flex items-center">
                <Calendar className="mr-3 h-5 w-5 text-gray-500" />
                <span>Created: {format(new Date(delivery.created_at), 'PPp')}</span>
              </div>
              {delivery.estimated_delivery_time && (
                <div className="flex items-center">
                  <Clock className="mr-3 h-5 w-5 text-gray-500" />
                  <span>Est. Delivery: {format(new Date(delivery.estimated_delivery_time), 'PPp')}</span>
                </div>
              )}
              {delivery.actual_delivery_time && (
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                  <span>Delivered: {format(new Date(delivery.actual_delivery_time), 'PPp')}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {delivery.deliveryPartner && (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Partner</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={delivery.deliveryPartner.user.avatar_url} />
                  <AvatarFallback>{delivery.deliveryPartner.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{delivery.deliveryPartner.user.name}</p>
                  <p className="text-sm text-gray-500">{delivery.deliveryPartner.user.email}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="timeline">
            <TabsList className="w-full">
              <TabsTrigger value="timeline">
                <Truck className="mr-2 h-4 w-4" />
                Delivery Timeline
              </TabsTrigger>
              <TabsTrigger value="orderItems">
                <ListOrdered className="mr-2 h-4 w-4" />
                Order Items
              </TabsTrigger>
            </TabsList>
            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {delivery.stages.map((stage, index) => (
                      <TimelineItem key={index} stage={stage} isLast={index === delivery.stages.length - 1} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="orderItems">
              <Card>
                <CardHeader>
                  <CardTitle>Order Items ({order.items.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item: OrderItem) => (
                        <TableRow key={item.product_id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(item.unit_price)}</TableCell>
                          <TableCell>{new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(item.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}