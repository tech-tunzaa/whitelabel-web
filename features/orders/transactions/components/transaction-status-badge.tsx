'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TransactionStatus } from '../types';

interface TransactionStatusBadgeProps {
  status: TransactionStatus;
  className?: string;
}

export default function TransactionStatusBadge({
  status,
  className,
}: TransactionStatusBadgeProps) {
  const getStatusColors = (status: TransactionStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 hover:bg-red-100 border-red-200';
      case 'refunded':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200';
      case 'partially_refunded':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200';
    }
  };

  const getStatusLabel = (status: TransactionStatus) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      case 'refunded':
        return 'Refunded';
      case 'partially_refunded':
        return 'Partially Refunded';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium capitalize',
        getStatusColors(status),
        className
      )}
    >
      {getStatusLabel(status)}
    </Badge>
  );
}
