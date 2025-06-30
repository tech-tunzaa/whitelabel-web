import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown } from 'lucide-react';
import { Order } from '@/features/orders/types';
import { formatCurrency } from '../utils';

interface OrderItemsCardProps {
  order: Order;
  itemIndex: number;
  onRowClick?: () => void;
  isExpanded?: boolean;
}

export const OrderItemsCard: React.FC<OrderItemsCardProps> = ({ order, itemIndex, onRowClick, isExpanded }) => {
  const item = order.items[itemIndex];
  if (!item) return null;

  return (
    <TableRow 
      className="group hover:bg-muted/50 transition-colors cursor-pointer relative" 
      onClick={onRowClick}
    >
      <TableCell className="w-[50px] p-2">
        <Link 
          href={`/dashboard/products/${item.product_id}`} 
          className="block" 
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            alt={item.name}
            className="w-10 h-10 rounded object-cover"
            height="40"
            src={'/placeholder.svg'}
            width="40"
          />
        </Link>
      </TableCell>
      <TableCell>
        <Link 
          href={`/dashboard/products/${item.product_id}`} 
          className="font-medium hover:text-primary transition-colors line-clamp-1"
          onClick={(e) => e.stopPropagation()}
        >
          {item.name}
        </Link>
        <div className="text-sm text-muted-foreground">
          <span className="font-mono">{item.sku}</span>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <span className="font-medium">{item.quantity}</span>
      </TableCell>
      <TableCell className="text-right">
        <div className="font-medium">{formatCurrency(item.unit_price)}</div>
      </TableCell>
      <TableCell className="text-right">
        <div className="font-semibold text-primary">{formatCurrency(item.total)}</div>
      </TableCell>
      <TableCell className="text-right pr-10 relative">
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <ChevronDown 
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:text-foreground ${isExpanded ? 'rotate-180' : ''}`} 
          />
        </div>
      </TableCell>
    </TableRow>
  );
};
