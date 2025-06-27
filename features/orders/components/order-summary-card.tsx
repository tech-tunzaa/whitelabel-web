import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Order } from '@/features/orders/types';
import { formatCurrency } from '../utils';

interface OrderSummaryCardProps {
  order: Order;
}

const SummaryLineItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span>{value}</span>
  </div>
);

export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({ order }) => {
  const { totals } = order;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        <SummaryLineItem label="Subtotal" value={formatCurrency(totals.subtotal)} />
        <SummaryLineItem label="Shipping" value={formatCurrency(totals.shipping)} />
        <SummaryLineItem label="Tax" value={formatCurrency(totals.tax)} />
        <SummaryLineItem label="Discount" value={formatCurrency(totals.discount)} />
      </CardContent>
      <CardFooter className="flex items-center justify-between font-semibold">
        <span className="text-lg">Total</span>
        <span className="text-lg">{formatCurrency(totals.total)}</span>
      </CardFooter>
    </Card>
  );
};
