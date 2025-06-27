'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useOrderStore } from '@/features/orders/store';
import { useParams } from 'next/navigation';

import { OrderHeader } from './order-header';
import { CustomerInfoCard } from './customer-info-card';
import { ShippingInfoCard } from './shipping-info-card';
import { OrderSummaryCard } from './order-summary-card';
import { OrderItemsCard } from './order-items-card';
import { VendorResponsesCard } from './vendor-responses-card';
import { PaymentDetailsCard } from './payment-details-card';
import { InstallmentPlanCard } from './installment-plan-card';
import { RefundsCard } from './refunds-card';
import { DeliveryInfoCard } from './delivery-info-card';
import { OrderNotesCard } from './order-notes-card';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const OrderDetailsView = () => {
  const { id: orderId } = useParams();
  const { data: session } = useSession();
  const tenantId = (session?.user as any)?.tenant_id;

  const order = useOrderStore((state) => state.order);
  const transaction = useOrderStore((state) => state.transaction);
  const loading = useOrderStore((state) => state.loading);
  const error = useOrderStore((state) => state.error);
  const fetchOrder = useOrderStore((state) => state.fetchOrder);
  const fetchTransactionDetails = useOrderStore((state) => state.fetchTransactionDetails);
  const clearStore = useOrderStore((state) => state.clearStore);

  const transactionId = order?.payment_details.transaction_id;

  useEffect(() => {
    if (orderId && tenantId) {
      fetchOrder(orderId as string, { 'X-Tenant-ID': tenantId });
    }

    return () => {
      clearStore();
    };
  }, [orderId, tenantId, fetchOrder, clearStore]);

  useEffect(() => {
    if (transactionId && tenantId) {
      fetchTransactionDetails(transactionId, {
        'X-Tenant-ID': tenantId,
      });
    }
  }, [transactionId, tenantId, fetchTransactionDetails]);

  if (loading && !order) {
    return <OrderDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Alert variant="destructive" className="max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-full p-8">
         <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Order Not Found</AlertTitle>
          <AlertDescription>The requested order could not be found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasPlan = !!order.plan;
  const hasRefunds = order.refunds && order.refunds.length > 0;

  const tabList = [
    { value: 'items', label: 'Order Items' },
    { value: 'vendors', label: 'Vendor Responses' },
    { value: 'payment', label: 'Payment' },
    ...(hasPlan ? [{ value: 'installments', label: 'Installments' }] : []),
    ...(hasRefunds ? [{ value: 'refunds', label: 'Refunds' }] : []),
  ];

  return (
    <div className="flex flex-col h-full bg-muted/40">
      <OrderHeader order={order} />
      <main className="grid flex-1 items-start gap-4 p-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-6 lg:col-span-2">
          <Tabs defaultValue="items">
            <TabsList className={`grid w-full grid-cols-${tabList.length}`}>
              {tabList.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="items">
              <OrderItemsCard order={order} />
            </TabsContent>
            <TabsContent value="vendors">
              <VendorResponsesCard order={order} />
            </TabsContent>
            <TabsContent value="payment">
              <PaymentDetailsCard order={order} transaction={transaction} />
            </TabsContent>
            {hasPlan && (
              <TabsContent value="installments">
                <InstallmentPlanCard plan={order.plan!} />
              </TabsContent>
            )}
            {hasRefunds && (
              <TabsContent value="refunds">
                <RefundsCard order={order} />
              </TabsContent>
            )}
          </Tabs>
        </div>
        <div className="grid auto-rows-max items-start gap-4 md:gap-6 lg:col-span-1">
            <OrderSummaryCard order={order} />
            <CustomerInfoCard order={order} />
            <ShippingInfoCard order={order} />
            <DeliveryInfoCard order={order} />
            <OrderNotesCard order={order} />
        </div>
      </main>
    </div>
  );
};

const OrderDetailsSkeleton = () => (
    <div className="p-4 sm:px-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b">
            <Skeleton className="h-8 w-48" />
            <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
            </div>
        </div>
        <div className="grid gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
            <div className="lg:col-span-1 space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        </div>
    </div>
);
