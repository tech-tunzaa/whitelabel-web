import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Order } from '@/features/orders/types';
import { formatCurrency, formatDate } from '../utils';
import { Badge } from '@/components/ui/badge';

interface RefundsCardProps {
  order: Order;
}

export const RefundsCard: React.FC<RefundsCardProps> = ({ order }) => {
  if (!order.refunds || order.refunds.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Refunds</CardTitle>
        <CardDescription>This order has {order.refunds.length} refund(s).</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {order.refunds.map((refund) => (
            <div key={refund.refund_id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-semibold text-lg">{formatCurrency(refund.amount)}</p>
                  <p className="text-sm text-muted-foreground">
                    Processed on {formatDate(refund.processed_at)}
                  </p>
                </div>
                <Badge variant="secondary">{refund.status}</Badge>
              </div>
              {refund.reason && <p className="text-sm mb-2"><strong>Reason:</strong> {refund.reason}</p>}
              {refund.notes && <p className="text-sm mb-4 p-2 bg-gray-50 rounded-md"><strong>Notes:</strong> {refund.notes}</p>}

              <h4 className="font-semibold mb-2">Refunded Items</h4>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {refund.items.map((item) => (
                      <TableRow key={item.item_id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
