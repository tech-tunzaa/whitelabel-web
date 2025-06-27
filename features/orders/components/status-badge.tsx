import React from 'react';
import { Badge, BadgeProps } from '@/components/ui/badge';
import {
  Clock,
  RefreshCw,
  BadgeCheck,
  Truck,
  Home,
  XCircle,
  CircleDollarSign,
  FileText,
} from 'lucide-react';
import { formatStatus } from '../utils';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config: Record<string, { variant: BadgeProps['variant']; icon: React.ElementType }> = {
    pending: { variant: 'outline', icon: Clock },
    processing: { variant: 'secondary', icon: RefreshCw },
    confirmed: { variant: 'default', icon: BadgeCheck },
    shipped: { variant: 'default', icon: Truck },
    delivered: { variant: 'success', icon: Home },
    completed: { variant: 'success', icon: BadgeCheck },
    cancelled: { variant: 'destructive', icon: XCircle },
    paid: { variant: 'success', icon: CircleDollarSign },
    failed: { variant: 'destructive', icon: XCircle },
    refunded: { variant: 'warning', icon: RefreshCw },
    partially_refunded: { variant: 'warning', icon: RefreshCw },
    PENDING: { variant: 'outline', icon: Clock },
    PAID: { variant: 'success', icon: BadgeCheck },
    OVERDUE: { variant: 'warning', icon: Clock },
    CANCELLED: { variant: 'destructive', icon: XCircle },
    active: { variant: 'success', icon: BadgeCheck },
    defaulted: { variant: 'destructive', icon: XCircle },
    COMPLETED: { variant: 'success', icon: BadgeCheck },
  };

  const { variant, icon: Icon } = config[status?.toLowerCase()] || { variant: 'secondary', icon: FileText };

  return (
    <Badge variant={variant} className="flex items-center gap-1.5 capitalize">
      <Icon className="h-3.5 w-3.5" />
      {formatStatus(status)}
    </Badge>
  );
};
