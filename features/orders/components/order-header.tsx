import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Order } from '@/features/orders/types';
import { StatusBadge } from './status-badge';
import { formatDate, copyToClipboard } from '../utils';

interface OrderHeaderProps {
  order: Order;
}

export const OrderHeader: React.FC<OrderHeaderProps> = ({ order }) => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between gap-4 p-4 border-b">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <Avatar className="hidden h-12 w-12 sm:flex">
          <AvatarFallback>
            <Package className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold md:text-xl">
              Order #{order.order_number}
            </h1>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => copyToClipboard(order.order_number, 'Order Number')}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>ID: {order.order_id}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => copyToClipboard(order.order_id, 'Order ID')}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            <time dateTime={order.created_at}>
              {formatDate(order.created_at)}
            </time>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={order.status} />
        <StatusBadge status={order.payment_status} />
      </div>
    </div>
  );
};
