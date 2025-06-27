import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ClipboardCopy, User } from 'lucide-react';
import { Order } from '@/features/orders/types';
import { copyToClipboard } from '../utils';

interface CustomerInfoCardProps {
  order: Order;
}

export const CustomerInfoCard: React.FC<CustomerInfoCardProps> = ({ order }) => {
  const customerAddress = order.shipping_address;

  if (!customerAddress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Customer information not available.</p>
        </CardContent>
      </Card>
    );
  }

  const customerName = `${customerAddress.first_name} ${customerAddress.last_name}`.trim();
  const customerInitials = `${customerAddress.first_name?.[0] || ''}${customerAddress.last_name?.[0] || ''}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>{customerInitials || <User />}</AvatarFallback>
          </Avatar>
          <div className="grid gap-1 text-sm">
            <Link href={`/dashboard/customers/${order.user_id}`} className="font-semibold text-primary hover:underline">
              {customerName}
            </Link>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">{customerAddress.email}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(customerAddress.email, 'Email')}
              >
                <ClipboardCopy className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">{customerAddress.phone}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(customerAddress.phone, 'Phone Number')}
              >
                <ClipboardCopy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
