import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Order } from '@/features/orders/types';

interface OrderNotesCardProps {
  order: Order;
}

export const OrderNotesCard: React.FC<OrderNotesCardProps> = ({ order }) => {
  if (!order.notes) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {order.notes}
        </p>
      </CardContent>
    </Card>
  );
};
