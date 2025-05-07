import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "../../components/order-status-badge";
import { useOrderStore } from "../../stores/order-store";
import type { Order } from "../../types/order";

interface RefundTableProps {
  orders: Order[];
  refundStatus: "pending" | "approved" | "rejected";
}

export function RefundTable({ orders, refundStatus }: RefundTableProps) {
  const router = useRouter();
  const { updateOrder } = useOrderStore();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "TZS",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "default";
    }
  };

  const handleApproveRefund = (order: Order) => {
    // Update the order's refund status to approved
    const updatedOrder = {
      ...order,
      refundStatus: "approved" as const,
      timeline: [
        ...order.timeline,
        {
          status: "refunded",
          timestamp: new Date().toISOString(),
          note: "Refund approved and processed to original payment method",
        },
      ],
    };
    updateOrder(updatedOrder);
    toast.success(`Refund for order #${order.id} has been approved`);
  };

  const handleRejectRefund = (order: Order) => {
    // Update the order's refund status to rejected
    const updatedOrder = {
      ...order,
      refundStatus: "rejected" as const,
      timeline: [
        ...order.timeline,
        {
          status: "cancelled",
          timestamp: new Date().toISOString(),
          note: "Refund request has been rejected",
        },
      ],
    };
    updateOrder(updatedOrder);
    toast.success(`Refund for order #${order.id} has been rejected`);
  };

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="hidden md:table-cell">Customer</TableHead>
            <TableHead className="hidden md:table-cell">Reason</TableHead>
            <TableHead className="hidden md:table-cell">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            // Find refund related events in timeline
            const refundEvent = order.timeline.find(
              (event) => event.status.toLowerCase().includes("refund") || event.status === "returned"
            );
            
            return (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">{formatDate(order.orderDate)}</span>
                    <span className="text-xs text-muted-foreground hidden md:inline-block">
                      {format(new Date(order.orderDate), "h:mm a")}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-col">
                    <span>{order.customer.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {order.customer.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="max-w-xs truncate">
                    {refundEvent?.note || "No reason provided"}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {formatCurrency(order.total)}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(order.refundStatus)}>
                    {getStatusLabel(order.refundStatus)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/orders/refunds/${order.id}`)}>  
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      
                      {order.refundStatus === "pending" && (
                        <>
                          <DropdownMenuItem onClick={() => handleApproveRefund(order)}>
                            Approve refund
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRejectRefund(order)}>
                            Reject refund
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/orders/${order.id}`)}>  
                        View order
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
          {orders.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-8 text-muted-foreground"
              >
                No refund requests found matching your criteria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
