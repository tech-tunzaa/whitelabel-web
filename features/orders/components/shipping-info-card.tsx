import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardCopy, Truck } from 'lucide-react';
import { Order } from '@/features/orders/types';
import { copyToClipboard, formatStatus } from '../utils';

interface ShippingInfoCardProps {
  order: Order;
}

export const ShippingInfoCard: React.FC<ShippingInfoCardProps> = ({ order }) => {
  const { shipping_address, shipping_method } = order;

  const fullAddress = [
    `${shipping_address.first_name} ${shipping_address.last_name}`,
    shipping_address.street,
    `${shipping_address.city}, ${shipping_address.state} ${shipping_address.postal_code}`,
    shipping_address.country,
  ].filter(Boolean).join(', ');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Shipping</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => copyToClipboard(fullAddress, 'Shipping Address')}
        >
          <ClipboardCopy className="h-3.5 w-3.5 mr-2" />
          Copy Address
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div>
            <h3 className="font-semibold mb-1">Address</h3>
            <p className="text-sm text-muted-foreground">
              {fullAddress}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Shipping Method</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="h-4 w-4"/>
                <span>{formatStatus(shipping_method)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
