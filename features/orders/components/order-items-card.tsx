import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Order } from '@/features/orders/types';
import { formatCurrency } from '../utils';

interface OrderItemsCardProps {
  order: Order;
}

export const OrderItemsCard: React.FC<OrderItemsCardProps> = ({ order }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Items ({order.items.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] hidden sm:table-cell">Image</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((item) => (
              <TableRow key={item.item_id}>
                <TableCell className="hidden sm:table-cell">
                  <Link href={`/dashboard/products/${item.product_id}`}>
                    <Image
                      alt={item.name}
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      // The OrderItem type does not currently include product images.
                      // Using a placeholder for now.
                      src={'/placeholder.svg'}
                      width="64"
                    />
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/dashboard/products/${item.product_id}`} className="font-medium hover:underline">
                    {item.name}
                  </Link>
                  <div className="text-sm text-muted-foreground">
                    SKU: {item.sku}
                  </div>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
